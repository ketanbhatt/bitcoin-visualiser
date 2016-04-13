/**
 * Created by ketanbhatt on 13/04/16.
 */

$().ready(function () {
    var myFirebaseRef = new Firebase("https://scorching-fire-4667.firebaseio.com/");
    var userRef = null;

    var $userBalance = $("#user-balance");

    $("#usernameForm").submit(function( event ) {
        event.preventDefault();
        var username = $('#inputUserName').val();
        userRef = myFirebaseRef.child(username);

        //Initialise user if not already
        userRef.transaction(function (current_value) {
            return (current_value || 0);
        });

        //Listen to changes
        userRef.on('value', function (snapshot) {
            var newBalance = snapshot.val();
            var currentBalance = parseInt($userBalance.text());
            if(newBalance > currentBalance) {
                alert("Received " + (newBalance - currentBalance) + " BTC! Yaay");
            }
            $userBalance.text(newBalance);
        });

        //Set username on the navbar and hide form
        $("#nav-username").text(username);
        $("#usernameForm").hide();
        $("#main-content").show();
    });

    $("#sendSatoshiForm").submit(function( event ) {
        event.preventDefault();
        var receiver = $('#sendTousername').val();
        var btc = parseInt($('#bitcoinAmount').val());

        if(confirm("Do you want to send " + btc + " BTC to " + receiver + "?")) {
            //Check user has money
            userRef.transaction(function (current_btc) {
                if(current_btc < btc) {
                    alert("You dont have the requested money in your account")
                } else {
                    //Transfer btc to receiver
                    myFirebaseRef.child(receiver).transaction(function (current_value) {
                        return (current_value || 0) + btc;
                    });
                    alert("Wohooo Bitcoins sent!");
                    return (current_btc - btc);
                }
            });
            //Reset form
            $("#sendSatoshiForm")[0].reset();
        } else {
            alert("You cancelled the transaction");
        }

    });
});

