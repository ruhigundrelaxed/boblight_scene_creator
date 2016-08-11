![Logo](https://github.com/ruhigundrelaxed/ioBroker.boblight/raw/master/admin/boblight.png)
Scene creator for ioBroker motion Adapter
==============


### 0.0.0 (2016-11-08)
Pre Release
Known Bugs and Issues:
Prove of concept... 



## How it works

1st.)   populate the scene directory with a set of image files. this files should be jpg (png should work as well, but not yet testet)<br>
A scene could be one ore multiple pictures. (tried out a scene with ~7500 pictures which results in a 500Mb scene json file)
If there are many files, the naming should be: scenename_1.jpg scenename_2.jpg ... scenename_xxxx.jpg
You can generate those images with gimp (if there are just a few) or you can use ffmpeg to split them out a avi file.
with e.g.: ffmpeg -i infile.avi -f image2 image-%03d.jpg
  
2nd.)   run create.js (it accepts 3 parameters, but defaults for if not applied)<br>
        1 parameter: the instance id of the boblight instance. it defaults to 0.<br>
        2 parameter: the hostname of the boblight server: it defaults to 127.0.0.1<br>
        3 parameter: the port of the boblight server: it defaults to 19333<br>
        The software needs to know the boblight server, to pull out the light configuration.<br>
        The instance is just used for the fielname.<br>
        
        For each scene a output json file is generated. "boblight.0.scenename.json" <br>
        Those files should be copied to the scenes directory of your boblight adapter.<br>
        
        

## Usage

## License

The MIT License (MIT)

Copyright (c) 2015 ruhigundrelaxed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
