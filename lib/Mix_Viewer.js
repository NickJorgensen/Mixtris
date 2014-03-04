
var $ = require('../public/js/jquery-1.10.2.js')
// var gui = global.window.nwDispatcher.nwGui;
module.exports = {
	makeTable: function(attacher){
		var startTable = $('<table></table>').attr('id','mixTable').appendTo(attacher)
		return startTable
	},
	makeTableRow: function(attacher){
		var tr = $('<tr></tr>').appendTo(attacher)
		return tr
	},
	makeSaveHiddenInput: function(){
		var fInput = $('<input></input>').appendTo('body')
		.css('display','none')
		.attr('type','file')
		.attr('nwdirectory','')
		return fInput
	},
	makeImportHiddenInput: function(){
		var fInput2 = $('<input></input>').appendTo('body')
		.css('display','none')
		.attr('type','file')
		.attr('accept','.json')
		return fInput2
	},
	buildWeight: function(attacher,data){
		var dt =$('<td></td>')
		.attr('data-name',data.MIXTRIS_FILE)
		.appendTo(attacher)
		$('<span></span>').appendTo(dt)
		.css('margin-right','10px')
		.text('weight')
		var weight = 1
		if(data.WEIGHT) {
			weight = parseInt(data.WEIGHT)
		}
		var select = $('<select></select>')
		.attr('id','weightSelect')
		.appendTo(dt)
		$('<option></option>').attr('value','0').text('0').appendTo(select)
		$('<option></option>').attr('value','1').text('1').appendTo(select)
		$('<option></option>').attr('value','2').text('2').appendTo(select)
		$('<option></option>').attr('value','3').text('3').appendTo(select)
		$('<option></option>').attr('value','4').text('4').appendTo(select)
		$('<option></option>').attr('value','5').text('5').appendTo(select)
		$('<option></option>').attr('value','6').text('6').appendTo(select)
		$('<option></option>').attr('value','7').text('7').appendTo(select)
		$('<option></option>').attr('value','8').text('8').appendTo(select)
		$('<option></option>').attr('value','9').text('9').appendTo(select)
		$(select.find('option')[weight]).attr('selected','selected')
		return select
	},
	buildDirectoryLabel: function(attacher,data){
		var dt =$('<td></td>')
		.appendTo(attacher)
		$('<span></span>').appendTo(dt)
		.text(data.MUSIC_DIRECTORY).css('width','50px')
	},
	buildMixtrisFileName: function(attacher,data){
		var dt =$('<td></td>')
		.appendTo(attacher)
		.attr('data-name',data.MIXTRIS_FILE)
		$('<span></span>').appendTo(dt)
		.text(data.MIXTRIS_FILE)
		.css('width','50px')
	},
	buildSaveButton: function(attacher,data){
		var dt =$('<td></td>').appendTo(attacher)
		.attr('data-name',data.MIXTRIS_FILE)
		var bt = $('<button></button>').appendTo(dt)
		.attr('class','btFloat')
		.attr('type','button')
		.css('float','right')
		.text('Export Backup')
		return bt
	},
	buildDeleteButton: function(attacher,data){
		var dt =$('<td></td>').appendTo(attacher)
		.attr('data-name',data.MIXTRIS_FILE)			
		var bt = $('<button></button>').appendTo(dt)
		.attr('class','btFloat')
		.attr('type','button')
		.css('float','right')
		.text('Delete')
		return bt
	}
}