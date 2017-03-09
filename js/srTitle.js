if(session == "") { //로그인이 필요함
    login = "로그인"//로그인이 필요함
    loginHref = "/login"//로그인이 필요함
    userName = "로그인이 필요합니다";
    userClass = "로그인이 필요합니다";
} else {
    login = "로그아웃"//로그인 되어있음
    loginHref = "/logout"//로그인되어있음
    userName = session['name'];
    if(session['id'].toString().substr(1,2) < 4) { userClass = "정보통신과 " + session['id'];} else if(session['id'].toString().substr(1,2) < 7) { userClass = "웹운영과 " + session['id'];} else if(session['id'].toString().substr(1,2) < 10) { userClass = "테크노경영과 " + session['id'];} else { userClass = "멀티미디어과 " + session['id'];}
    
    if(session['id'].toString().length == 1) { userClass = "교사";}
}

document.body.innerHTML += "<div id='srTitle'><div id='tab'><div id='userInfo'><div id='userImage'></div><div id='userName'>"+userName+"</div><div style='margin:0 5px;color:rgba(255,255,255,0.5)'>|</div><div id='userClass'>"+userClass+"</div></div><a class='tabItem' href='/srNow'>srNow</a><a class='tabItem' href='"+loginHref+"'>"+login+"</a></div><div id='header'><a id='logo' href='/srHome'><p>"+document.title+"</p></a></div></div>"