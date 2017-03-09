var request = require('request');
var db = require("./dbconfig");

function ParseSchedule( req, res ){
	db.Schedules.findOne({ "grade" : req.params['grade'], "class" : req.params['class'], "day" : req.params['day'] }, function( err, result ){
		if( err ){
			throw err;
		}
		if( result ){
			res.send(result);
		} else {
			res.send({});
		}
	});
}

function ParseAnnounce( req, res ){
	var url = "http://sunrint.hs.kr/notice/board.do?bcfNo=1232055"
	var key = "공지/행사 목록";
	request( url, function( err, response, body ){
		if( err ){
			throw err;
		}
		if( response.statusCode !== 200 ){
			res.end();
		}
		var string = body.substr(body.indexOf(key));
//		string = body.substring(0,string.indexOf("</tbody>"));
		var arr = [];
		string.match(/view\([\s\S]*?<\/a>/g).forEach(function(text){
			var obj = {};
			text = text.replace(/                             /g,"").replace(/\r\n/g,"").replace(/                            /g,"");
			var bcfNo = text.substr(5,7);
			var contentNo = text.substr(14,9);
			obj.url = "http://sunrint.hs.kr/notice/board.do?cmd=view&bcfNo=" + bcfNo + "&contentNo=" + contentNo;
			obj.title = text.substring(text.indexOf("<!--들여쓰기 이미지.-->")+16,text.indexOf("</a>"));
//			if( a != " " ){
//				a.shift()
				arr.push(obj);
//				arr.push(a);
//			}
		});
//		console.log(arr);
		res.send(arr);
	});
}

function Parse( req, res ){
	var type = req.params['type'];
	var mm = req.params['mm'];
	var ay = req.params['ay'];
	console.log(req.params);
	var key = "";
	var url_key = "";
	if( type == "md" ){
		key = "월간식단 달력";
		url_key = "00";
	} else if( type == "sf" ){
		key = "월간학사일정 달력";
		url_key = "01";
	}
	var url = "http://stu.sen.go.kr/sts_sci_" + type + url_key + "_001.do?schulCode=B100000658&schulCrseScCode=4&schulKndScCode=04&ay=" + ay + "&mm=" + mm
	var today = new Date()
	request( url, function( err, response, body ){
		if( err ){
			throw err;
		}
		if( response.statusCode !== 200 ){
			res.end();
		}
		var string = body.substring(body.indexOf(key));
		string.substring(0,string.indexOf("/table"));
		var arr = [];
		if( type == "md" ){
			string.match(/<td[^>]*><div>[\s\S]*?<\/div>/g).forEach(function(text){
				var a = text.substring(9,text.indexOf("</div>")).replace(/\=\"last\"><div>/g,"").split("<br />");
				if( a != " " ){
					a.shift()
					arr.push(a);
				}
			});
		} else if( type == "sf" ){
			string.match(/<div[^>]*>[\s\S]*?<\/div>/g).forEach(function(text){
				if( text.indexOf("></em>") == -1 ){
					var a = "";
					if( text.indexOf("strong") >= 0 ){
						a = text.substring(text.indexOf("<strong>")+8,text.indexOf("</strong>"));
					}
					arr.push(a);
				}
			});
		}
		if( type == "md" ){
		} else if ( type == "sf" ){
		}
		res.send(arr);
	});
}


module.exports = {
	parse : Parse,
	parseAnnounce : ParseAnnounce,
	parseSchedule : ParseSchedule
}
