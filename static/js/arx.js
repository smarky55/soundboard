// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.



function ArxReader(arxBuffer){
    this.buffer = arxBuffer;
    this.cursor = 0;

    this.getChars = function(data){
        var out = '';
        data.forEach(function(item){
            out = out + String.fromCharCode(item);
        });
        return out;
    }

    this.getInt = function(data){
        var hex = '';
        data.forEach(function(item){
            // Data stored as little endian
            // Convert back from dec to hex
            hex = item.toString(16) + hex;
        });
        //console.log(hex);
        return parseInt(hex, 16);
    }

    this.getFile = function(path, loc, length){
        var pattern = /(?:(\w+):)?((?:\w+:)*\w+\.\w+)/i;
        if(loc === undefined || length ===undefined){
            loc = this.baseDirLoc;
            length = this.baseDirSize;
        }
        this.cursor = loc;
        var record = this.buffer.slice(loc, loc+length);
        if(this.getChars(record.slice(0,3)) === 'DIR'){
            var match = pattern.exec(path);
            var i = 3
            for (; i < length; i += 64){
                var name = this.getChars(record.slice(i+8, i+64));
                console.log(name, match[2]);
                if(name.startsWith(match[1]) || name.startsWith(match[2])){
                    var nextLoc = this.getInt(record.slice(i, i+4));
                    var nextLen = this.getInt(record.slice(i+4, i+8));
                    return this.getFile(match[2], nextLoc, nextLen);
                }
            }
            console.error('Unable to locate file', path);
            return undefined;
        } else if (this.getChars(record.slice(0,3)) === 'FIL') {
            return record.slice(3);
        }
    }

    header = arxBuffer.slice(0,0x10);
    //console.log(this.getChars(header));
    if (!this.getChars(header).startsWith('ARX')) {
        console.log('Invalid buffer format');
    } else {
        //console.log('success');
    }

    this.baseDirLoc = this.getInt(header.slice(6,6+4));
    this.baseDirSize = this.getInt(header.slice(10,10+4));

}
