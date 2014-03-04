
// (function () {
var asyncAlert = (function () {
	var self = {}
	function createDialogBox(msg,msg2,func1,func2) {
		// alert('d')
		console.log('ping()==')
		var wdth = window.innerWidth || $(window).innerWidth()
		var hght = window.innerHeight || $(window).innerHeight()
		var ctWidth = wdth/3
		if(ctWidth<300)ctWidth = 300 
		var ctHeight = ctWidth*.7
		var iconDiv =  $('<div></div>')
		.attr('id','master_alert')
		.attr('class','alerty')
		.css('position','fixed')
		.css('z-index','1100000')
		.css('width',wdth)
		.css('height',hght)
		.css('left',0)
		.css('top',0)
		.css('background','rgba(250,250,250,0.3)')
		.appendTo('body')
		var iconDivSub =  $('<div></div>')
		.css('position','absolute')
		.css('width',ctWidth)
		.css('height',ctHeight)
		.css('left',(wdth-ctWidth)/2)
		.css('top',(hght-ctHeight)/2)
		// .css('background','rgb(245,250,245)')
		.css('background','ghostwhite')
		// .css('border-radius',hght/2+'px')
		.css('outline','20px solid ghostwhite')
		.css('box-shadow','2px 2px 100px black')
		.appendTo(iconDiv)
		.on('touchmove', function(event) {
			return false
		}) 
		var OneButtonContainer =  makeSingleContainer(iconDivSub,ctHeight-60,ctWidth*.9)
		.text(msg)
		.css('font-size','28px')
		.css('margin-top','10px')
		.css('margin-bottom','')
		.css('text-align','center')
		var OneButtonContainer =  makeSingleContainer(OneButtonContainer,ctHeight-60,ctWidth*.9)
		.text(msg2)
		.css('margin-top','10px')
		.css('margin-bottom','')
		.css('text-align','center')
		.css('font-size','20px')
		.css('color','firebrick')
		
		
		if(func2===null) {
			var btCt = $('<div></div>').appendTo(iconDivSub).css('width',ctHeight-'150px').css('height',40).css('margin-left','auto').css('margin-top','10px').css('margin-right','auto')
			var bt = $('<button></button>').text('Ok').appendTo(btCt).css('width','150px').css('height',40).click(function(e){
			
				func1()
			})
		} else {
			var btCt = $('<div></div>').appendTo(iconDivSub).css('width',ctWidth-120).css('height',40).css('margin-left','auto').css('margin-top','10px').css('margin-right','auto')
			var bt = $('<button></button>').text('Ok').appendTo(btCt).css('width','74px').css('height',40).css('float','left').click(function(e){
			
				func1()
			})
			var bt = $('<button></button>').text('Cancel').appendTo(btCt).css('width','74px').css('height',40).css('float','right').click(function(e){
			
				func2()
			})
			
			
		}
		function returnButtion() {
			var btCt = $('<div></div>').appendTo(iconDivSub).css('width',ctWidth-120).css('margin-left','auto').css('margin-top','10px').css('margin-right','auto')
			return btCt
		}
		function makeSingleContainer(atchr,h,w) {
			if(!w) w = window.innerWidth/1.8
			var OneButtonContainer =  $('<div></div>')
				.attr('class','masterButtons')
				.css('height',h)
				.css('width',w)
				.css('margin','20px')
				.css('margin-left','auto')
				.css('margin-right','auto')
				.appendTo(atchr)
			return OneButtonContainer
		}
	}
	self.createDialogBox = createDialogBox
	return self
}())