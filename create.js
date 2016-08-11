var getPixels = require("get-pixels");
var net = require('net');
var numCPUs = require('os').cpus().length;
var scene_dir = "./scene/";
var fs = require('fs');
var nr_files = fs.readdirSync(__dirname + '/scene/').length;
var log = require('single-line-log').stdout;
//var HOST = '192.168.123.1';
//var PORT = 19333;
var INSTANCEID = process.argv[3] || "0";
var HOST = process.argv[4] || "127.0.0.1";
var PORT = process.argv[5] || "19333";


var cluster = require('cluster');
var jf = require('jsonfile');

var gad = process.argv[4];




function getframe(file,light_arr,callback){

    getPixels(file,function(err,pixels){
        var mystr ="";
        if (err) {
            console.log(file);
            return
        }
        for (var b = 1; b <= (light_arr.length - 2); b++) {
            var ldata = light_arr[b].split(' ');
            var lname = ldata[1];
            yperc1 = ldata[3];
            yperc2 = ldata[4];
            xperc1 = ldata[5];
            xperc2 = ldata[6];
            xabs1 = Math.round((xperc1 / 100) * pixels.shape[0]);
            xabs2 = Math.round((xperc2 / 100) * pixels.shape[0]);
            yabs1 = Math.round((yperc1 / 100) * pixels.shape[1]);
            yabs2 = Math.round((yperc2 / 100) * pixels.shape[1]);
            var r_sum = 0;
            var g_sum = 0;
            var b_sum = 0;
            var mycount = 0;
            for (var i = xabs1; i < xabs2; ++i) {
                for (var j = yabs1; j < yabs2; ++j) {
                    r_sum += (pixels.get(i, j, 0));
                    g_sum += (pixels.get(i, j, 1));
                    b_sum += (pixels.get(i, j, 2));
                    mycount++;
                }
            }
            var avg_r = Math.round(((0.004 * (r_sum / mycount))) * 10000) / 10000;
            var avg_g = Math.round(((0.004 * (g_sum / mycount))) * 10000) / 10000;
            var avg_b = Math.round(((0.004 * (b_sum / mycount))) * 10000) / 10000;
            mystr = mystr + 'set light ' + lname + ' rgb ' + avg_r + ' ' + avg_g + ' ' + avg_b + '\n'
        }
        callback(file, mystr);
    })
}



if (cluster.isMaster) {
	
	var debug = process.execArgv.toString().indexOf('--debug') !== -1;
	cluster.setupMaster({
		execArgv: process.execArgv.filter(function (s) {
			return s !== '--debug'
		})
	});
    
	var client = new net.Socket();
	client.connect(PORT, HOST, function () {
		console.log('Connected to Boblightserver: ' + HOST + ':' + PORT + ' Saying hello...');
		client.write('hello\n');
	});
	client.on('data', function (data) {
		if (data.toString() == 'hello\n') {
			console.log('Server said hello to us! Asking for Version....')
			client.write('get version\n');
		}
		if (data.toString() == 'version 5\n') {
			console.log('Server answered: ' + data.toString());
			console.log('Asking Server for Light config... ');
			client.write('get lights\n');
		}
	if (numCPUs >= nr_files){
		
		numCPUs =  nr_files ;
		console.log("YESSSSSS!!!!!!! More CPUs then image files. Reducing no. of worker threads to :" +nr_files);
	}
		if (data.toString().substr(0, 5) == 'light') {
			console.log ('Got light configuration, closing socket.');
			client.destroy();
			light_arr = data.toString().split('\n');
			var file_arr = fs.readdirSync(scene_dir);
			for (var i = 0; i < numCPUs; i++) {
				if (debug) cluster.settings.execArgv.push('--debug=' + (5859 + i));
				var worker = cluster.fork();
				if (debug) cluster.settings.execArgv.pop();
				var scenes = [];
				var scenes_final = [];
				worker.on('message', function (msg) {
					var filename = msg[0].replace(scene_dir,"").split(".")[0];
					var scenename = filename.split("_")[0];
					if (typeof(filename.split("_")[1])=='undefined'){
						var framenr = 1;
					}else{
						var framenr = filename.split("_")[1];
					}
					log("Frame: "+framenr+ " of Scene: " + scenename +" processed. Total Frames remaining: " + file_arr.length );
					if (typeof(scenes[scenename])=='undefined'){
						scenes[scenename] = [];
						scenes_final[scenename] = [];
					}
					scenes[scenename].push([framenr,msg[1]]);
					if (file_arr.length !=0) {
						this.send([light_arr,file_arr.pop() ]);
					}else {
						this.kill();
					}
				})
			}
			cluster.on('online', function (worker) {
				if (file_arr.length > 0) {
					worker.send([light_arr, file_arr.pop()]);
				}
			});
			
			cluster.on('exit', function(worker, code, signal) {
				if((numCPUs--)==1){
					log.clear();
					console.log('\nmLast worker died! RIP! Sorting Frames and saving to JsonFile...');
					for (var scene in scenes){
						console.log('Sorting Scene: ' + scene);
						scenes[scene].sort(function(a,b){return parseInt(a[0]) - parseInt(b[0])});
						for (y=0; y<=scenes[scene].length - 1; y++){
							scenes_final[scene].push(scenes[scene][y][1])
							   
						}
						console.log('Saving JSON: ' + scene);
						jf.writeFileSync('boblight.' + INSTANCEID + '.' + scene+'.json',scenes_final[scene]);
					}
					console.log("Ready.. Exiting");
					process.kill(process.pid, 'SIGHUP');
				}
			});
		}
	})
} else {
	process.on('message', function(msg){
		getframe(scene_dir+msg[1], msg[0], function (file, mystr) {
			process.send([file,mystr,process.pid]);
		});
	});
};




    // Fork workers.

    //Object.keys(cluster.workers).forEach(function(id) {
    //    console.log("I am running with ID : "+cluster.workers[id].process.pid);
    //});


