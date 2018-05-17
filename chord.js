/**
 * Created by gattonero1052@github
 *
 * each pattern starts with a simple straight line, animated as a quadratic bezier curve
 * we can create a new line through right-click(hold on) and drag from start to end
 * we can change the line's color by left-click(hold on)
 * when the mouse moves over each pattern, there is a so called oscillation
 * the oscillation generally animates in these two periods:
 
 * hold:move the control point to be the same as the positon of mouse
 * retract:move the control point to the line(after that we turn a quadratic bezier curve into the origin line)
 
 * enjoy:)
**/



$(function(){
	
	//painter
	var painter = $('#painter')
	//painter.empty()
	
	//init
	var N = 20,MAXL = 200,MINL = 50,H = painter.height(),W = painter.width()
	
	
	var html = ""
	for(var i=0;i<N;i++){
		var sx = Math.random()*W | 0,sy = Math.random()*H | 0,
		theta = Math.random()*2*Math.PI,
		qtheta = Math.random()*2*Math.PI,
		l = MINL + Math.random()*(MAXL-MINL),
		ex = (sx+l*Math.cos(theta)) | 0,
		ey = (sy+l*Math.sin(theta)) | 0,
		qx = (sx+l*Math.cos(qtheta)) | 0,
		qy = (sy+l*Math.sin(qtheta)) | 0,
		randomColor = (Math.random()*16777215|0).toString(16)
		
		html+='<path d="M'+sx+','+sy+' Q'+qx+','+qy+' '+ex+','+ey+'" style="stroke-width:2; stroke: #'+randomColor+'; fill:none;"></path>'
	}
	
	painter.html(html)

	//init data
	$('path').each(function(){
		$(this).data('bez',new Bez($(this)))
	})
	
	
	painter.on('mousemove',function(e){
		var x = e.clientX-painter.offset().left,
		y = e.clientY-painter.offset().top,bez
		
		$('path').each(function(){
			var self = $(this)
			if(self.data('bez')){
				bez = self.data('bez')
				if(Math.abs(bez.half.x-x)<=100 && Math.abs(bez.half.y-y)<=100){
					if(!bez.moving){
						if(self.data('interval')){
							console.log('clearInterval'+self.data('interval'))
							clearInterval(self.data('interval'))
						}
					}
					
					bez.moving = true
					
					bez.setControl(x,y)
				}else if(bez.moving){
					bez.moving = false
					
					bez.setControlStart().setControlEnd()

					var start = new Date().getTime(),strengthWeak = 1.4, strength = 1,timeWeak = 0.5, halfTime = 70
					//var start = new Date().getTime(),strengthWeak = 0, strength = 1,timeWeak = 0, halfTime = 700
					
					;(function(bez,start){

						
						var interval = setInterval(function(){
							if(strength<0||halfTime<0) {
								clearInterval(interval)
								return
							}
							
							var t = (1+Math.cos((new Date().getTime()-start)/(halfTime)*Math.PI/2))/2,
							lx = bez.controlStart.x - bez.controlEnd.x,
							ly = bez.controlStart.y - bez.controlEnd.y,
						
							x = bez.controlEnd.x + ((1-strength)/2+(t)*strength)*lx,
							y= bez.controlEnd.y + ((1-strength)/2+(t)*strength)*ly
							
							
							bez.setControl(x,y)
							strength = (strength*100-strengthWeak)/100
							halfTime = halfTime - timeWeak
							
						},20)
						
						self.data('interval',interval)
					})(bez,start)
				}
			}
		})
	})
	
})

class Point {
	constructor(x,y){
		this.x = Number(x) || 0
		this.y = Number(y) || 0
	}
}

class Bez{
	constructor(path){
		this.path = path
		
		if(path.attr('d')){
			var d = this.d = path.attr('d')
		
			d.match(/[^ ]+/g).forEach((pattern)=>{
				var first = pattern.charAt(0),xy
				
				if(first=='M'){
					xy = pattern.substr(1).split(",")
					this.start = new Point(xy[0],xy[1])
				}else if(first=='Q'){
					xy = pattern.substr(1).split(",")
					this.control = new Point(xy[0],xy[1])
				}else{
					xy = pattern.split(",")
					this.end = new Point(xy[0],xy[1])
				}
			})
			
			this.half = new Point((this.start.x+this.end.x)/2,(this.start.y+this.end.y)/2)
		}
		
		this.moving = false
		
		return this
	}
	
	setControl(x,y){
		if(this.control){
			this.control.x = x
			this.control.y = y
		}else{
			this.control = new Point(x,y)
		}
		
		if(this.d)
			this.path.attr('d',this.d.replace(/Q[^ ]*/,'Q'+(x|0)+','+(y|0)))
		
		return this
	}
	
	setControlStart(){
		this.controlStart = new Point(this.control.x,this.control.y)
		return this
	}
	
	setControlEnd(x,y){
		var sx = this.start.x,sy = this.start.y,
		cx = this.control.x,cy = this.control.y,
		ex = this.end.x, ey = this.end.y,
		t=((cx-sx)*(sx-ex)+(cy-sy)*(sy-ey))/((sx-ex)*(sx-ex)+(sy-ey)*(sy-ey))

		
		this.controlEnd = new Point(
		2*(sx-ex)*t+2*sx-cx,
		2*(sy-ey)*t+2*sy-cy,
		)
		
		return this
	}
}