var TWITCH_URL = "http://twitch.tv";
var LEAGUE_URL = "http://leagueoflegends.com";
var initialButtonText = getButton().text();
var busyButtonText = 'Linking...';

function getCookie(details, success, failure) {
    chrome.cookies.get(details, function (cookie) {
        if (cookie && cookie.value) {
            success(cookie);
        } else {
            failure(cookie);
        }
    });
}

function sendCookies(cookies) {
    $.post('http://127.0.0.1:8001/link', cookies).then(function (data) {
        console.log(data);
        chrome.extension.sendMessage({command: 'setLink', link: data.link}, function(response) {
            addURL();
        });

        showSuccess(
            'Successfully linked twitch user<span class="twitch-name">' +
            data.twitch_name + '</span> to league user<span class="league-name">' +
            data.league_name
        );
    }, function (data) {
        console.log(data);
        showFailed('An error occurred.');
    }).always(function() {
        enableButton();
    });
}

function addURL() {
    chrome.extension.sendMessage({command: 'getLink'}, function(url) {
        if (url) {
            $('#user-url').html('Your URL: <a target="parent" href=' + url +'>' + url + '</a>');
        }
    });
}

function getButton() {
    return $('#click');
}

function getContent() {
    return $('#content');
}

function getTwitchInfo() {
    return $('#twitch-info');
}

function getLeagueInfo() {
    return $('#league-info');
}

function addTwitchInfo(name) {
    getTwitchInfo().html('Twitch name: <span class="twitch-name">' + name + '</span>');
}

function addLeagueInfo(name) {
    getLeagueInfo().html('League name: <span class="league-name">' + name + '</span>');
}

function disableButton() {
    getButton().prop('disabled', true);
    getButton().text(busyButtonText);
}

function enableButton() {
    getButton().prop('disabled', false);
    getButton().text(initialButtonText);
}

function showFailed(message) {
    getContent().append('<p class="failed">' + message + '</p>');
}

function showSuccess(message) {
    getContent().append('<p class="success">' + message + '</p>');
}

function getLeagueRegion(cb) {
    _getLeagueRegion(cb, function() {
        enableButton();
        showFailed("Failed. Make sure you are logged into www.leagueoflegends.com");
    });
}

function getTwitchPersistent(cb) {
    var details_twitch_persistent = {"url": TWITCH_URL, "name": "persistent"};

    getCookie(details_twitch_persistent, cb, function () {
        enableButton();
        showFailed('Failed. Make sure you are logged into www.twitch.tv');
    });
}

function getLeagueToken(region, cb) {
    var league_key = "PVPNET_TOKEN_" + region.toUpperCase();
    var details_league_token = {"url": LEAGUE_URL, "name": league_key};

    getCookie(details_league_token, cb, function () {
        enableButton();
        showFailed("Failed. Make sure you are logged into www.leagueoflegends.com");
    });
}

function _getLeagueRegion(success, failure) {
    var details_league_region = {"url" : LEAGUE_URL, "name": "PVPNET_REGION"};
    getCookie(details_league_region, success, failure);
}

function getLeagueName(region, success, failure) {
    var league_key = "PVPNET_ACCT_" + region.toUpperCase();
    var details_league_name = {"url": LEAGUE_URL, "name": league_key};

    getCookie(details_league_name, success, failure);
}

function getTwitchName(success, failure) {
    var details_twitch_name = {"url": TWITCH_URL, "name": "name"};
    getCookie(details_twitch_name, success, failure);
}

function getInfo() {
    _getLeagueRegion(function(region) {
        getLeagueName(region.value, function(name) {
            addLeagueInfo(name.value);
        }, function() { addLeagueInfo('n/a'); })
    }, function() { addLeagueInfo('n/a') });

    getTwitchName(function(name) {
        addTwitchInfo(name.value);
    }, function() { addTwitchInfo('n/a') });
}

function link() {
    disableButton();

    getTwitchPersistent(function(twitch_cookie) {
        getLeagueRegion(function(region) {
            getLeagueToken(region.value, function (league_token) {
                sendCookies({
                    "twitch": twitch_cookie,
                    "league": {region: region, token: league_token}
                });
            });
        });
    });
}

addURL();
getInfo();
getButton().get(0).addEventListener('click',  link);