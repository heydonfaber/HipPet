/**
 * Created by HeydonFaber on 15-06-02.
 */

exports.dataManager = function(){
    createNano = require('nano')('http://localhost:5984')

    try {
        createNano.db.create('imps_storage')
    }
    catch(alreadyCreated) {
        console.log("IMPS database already exists");
    }

    useDatabase = createNano.use('imps_storage')

    return {
        nano: createNano,
        database: useDatabase,
        save_settings: function(data, dataname){
            console.log (data);
            console.log (dataname);
            this.database.insert({ Pet: data }, dataname, function(err, body) {
            if (err) {
                console.log("Error with saving: " + err);
            }
            console.log("Save successful");
            });
        },
        load_settings: function(dataname, callback){
            this.database.get(dataname, callback)
        },
        replace: function(from, data){
            this.database.load_settings(stanza.attrs.from, function(exists, err) {
                if (err) {}
                else {
                    this.database.insert({Pet: data, _id: from, _rev: exists._rev}, function (err, body) {
                        if (err) {
                            console.log("Error with replacing: " + err);
                        }
                        console.log("Replacement successful");
                    });
                }
            });
        }
    }
}();