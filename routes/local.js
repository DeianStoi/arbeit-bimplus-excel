var express = require('express');
var router = express.Router();

const xlsxFile = require('read-excel-file/node');
var fs = require('fs'); // File system

//GET excel sheet
router.get('/excel/:fileName', function(req, res){
    var fileLoc = 'Excel/'
    var fileName = req.params.fileName;
    try{
        xlsxFile(fileLoc + fileName).then((rows) => {
            res.json({rows});
        });

    } catch (ex){
        console.log(ex)
    }
})

router.get('/saveToFile/:fileName/:text', function(req, res){
    var fileName = req.params.fileName;
    var text = req.params.text + '\n';
    
    fs.appendFile(fileName, text, function (fileErr) {
        if (fileErr) throw fileErr;
        var data = res.data;
        res.json({data})
    });
})

router.get('/deleteFile/:fileName', function(req, res){
    var fileName = req.params.fileName;
    fs.unlink(fileName, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    }); 
})

module.exports = router;