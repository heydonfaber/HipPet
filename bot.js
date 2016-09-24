/**
 * Created by Heydon on 15-06-01.
 */
const config = require('./config.js').settings;
const xmpp = require('node-xmpp-client');
const request_helper = require('request');
const ltx = require('ltx');
const dataManager = require('./database.js').dataManager;
const helpGuide = require('./helpguide.js').helpGuide;

var currentsubj = ''

const conn = new xmpp(config.client);
conn.connection.socket.setTimeout(0);
conn.connection.socket.setKeepAlive(true, 10000);

function set_status_message(status_message){
    var presence_elem = new ltx.Element('presence', { type: 'available' })
        .c('show').t('chat').up()
        .c('status').t(status_message);
    conn.send(presence_elem);
}

function request_hipchat_roster() {
    var roster_elem = new ltx.Element('iq', {from: conn.jid, type: 'get', id: 'hipchat-roster'})
        .c('query', {xmlns: 'jabber:iq:roster'});
    conn.send(roster_elem);
}

function ret_msg(body, stanza){
    return new ltx.Element('message', {to: stanza.attrs.from, type: 'chat'})
                    .c('body').t(body);
}

var currpet;
function stanza_interpreter(stanza) {
    if (stanza.is('presence')
        && stanza.attrs.type === 'subscribe') {
        var subscribe_elem = new ltx.Element('presence', {
            to: stanza.attrs.from,
            type: 'subscribed'
        });
        conn.send(subscribe_elem);
    }
    else if (stanza.is('message') && stanza.attrs.from != conn.jid && stanza.attrs.type === 'chat' ) {
        if (currentsubj == '') {
            if (stanza.getChildText('body') === 'load') {
                dataManager.load_settings(stanza.attrs.from, function (err, body) {
                    if (err) {
                        console.log("Error with retrieving data: " + err);
                    }
                    console.log("Load successful");
                    dataManager.mydata = body;
                });
            }
            else if (stanza.getChildText('body') === 'pet info') {
                console.log(dataManager.mydata);
            }
            else if (stanza.getChildText('body') === 'new pet imp') {
                impMaker = require('./petEngine.js').IMP;
                newImp = impMaker(stanza.attrs.from, '');
                currpet = newImp;
                require('./petEngine').petIntro(newImp, conn, stanza, ret_msg);
                currentsubj = 'petimp';
            }
        }
        else if (currentsubj == 'petimp') {
            if (stanza.getChildText('body') === 'name') {
                currentsubj = 'petimp_naming';
                conn.send(ret_msg('Please enter pet name...', stanza));
            }
            else if (stanza.getChildText('body') === 'reroll') {
                impMaker = require('./petEngine.js').IMP;
                newImp = impMaker(stanza.attrs.from, '');
                currpet = newImp;
                require('./petEngine').petIntro(newImp, conn, stanza, ret_msg);
                currentsubj = 'petimp_naming';
            }
            else if (stanza.getChildText('body') === 'help') {
                conn.send(ret_msg(helpGuide(currentsubj)), stanza);
            }
            else if (stanza.getChildText('body') === 'exit') {
                currentsubj = '';
            }
        }
        else if (currentsubj === 'petimp_naming') {
            if (stanza.getChildText('body') === 'help') {
                conn.send(ret_msg(helpGuide(currentsubj)), stanza);
            }
            else if (stanza.getChildText('body') === 'exit') {
                currentsubj = '';
            }
            //  else if (stanza.getChildText('body').search('^\s+')){
            //      conn.send(ret_msg('Invalid pet name. Cannot begin with spaces.'), stanza);
            //      conn.send(response_elem);
            //  }
            else if (stanza.getChildText('body')) {
                petname = stanza.getChildText('body');
                currpet.name = petname;
                dataManager.load_settings(stanza.attrs.from, function(err, exists){
                    if (err){
                        dataManager.save_settings(currpet, currpet.owner);
                        conn.send(ret_msg('New ' + currpet.type + ' created named ' + currpet.name), stanza);
                        currentsubj = ''
                    }
                    else {
                        conn.send(ret_msg('Level ' + exists.Pet.level + ' Pet ' + exists.Pet.type + ' ' +
                                exists.Pet.name + ' already exists. ' + 'Would you like' +
                                'to replace him with your new pet? (Yes/No)'), stanza);
                        currentsubj = 'petimp_replace'
                    }
                });

            }
        }
        else if (currentsubj === 'petimp_replace'){
            if (stanza.getChildText('body') === 'Yes'){
                dataManager.replace(stanza.attrs.from, currpet)
                currentsubj = ''
            }
            else if (stanza.getChildText('body') === 'No'){
                conn.send(ret_msg('Pet was not replaced. Newly created pet was discarded'), stanza);
                currentsubj = ''
            }
        }
    }
}

conn.on('online', function(){
    set_status_message(config.status_message);
    console.log("IMPS Online!");
});

conn.on('offline', function () {
    console.log('IMPS is offline')
});

conn.on('reconnect', function () {
    console.log('IMPS reconnects …')
});

conn.on('disconnect', function (e) {
    console.log('IMPS is disconnected', client.connection.reconnect, e)
});

if (config.allow_auto_subscribe){
    conn.addListener('online', request_hipchat_roster);
}

conn.on('stanza', stanza_interpreter);

process.on('uncaughtException', function (err) {
  console.log(err);
})