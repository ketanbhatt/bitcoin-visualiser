/**
 * Created by ketanbhatt on 13/04/16.
 */

$().ready(function () {
    var myFirebaseRef = new Firebase("https://scorching-fire-4667.firebaseio.com/");
    var blockchainRef = myFirebaseRef.child('blockchain');
    var userRef = null;
    var username = null;
    var $userBalance = $("#user-balance");
    var currentBalance = 0;

    var $urlContent = $("#url-content");
    var pgUrl = "http://www.paulgraham.com/";
    var bytesConsumed = 0;
    var $bytesConsumed = $("#bytes-consumed");

    var logToBlockchain = function (msg) {
        blockchainRef.push(msg)
    };

    var $blockchain = $("#blockchain-content");
    blockchainRef.limitToLast(10).on("child_added", function(snapshot, prevChildKey) {
        var block = snapshot.val();
        var blockHtml = '<div class="blockchain-block"><h4>' + block + '</h4></div>';
        $blockchain.prepend(blockHtml);
    });


    var deductBalance = function (user, btcToDeduct) {
        user.transaction(function (current_btc) {
            return (current_btc - btcToDeduct);
        });
    };

    //Code for showing website
    var loadUrlContent = function (pageUrl) {
        $.get(pgUrl + pageUrl, function( data ) {
            var kilobytesDownloaded = data.length / 1024;
            if ((kilobytesDownloaded * 0.1) > currentBalance ) {
                alert("Balance Insufficient. This action will need " + (kilobytesDownloaded * 0.1).toFixed(2) + " BTC")
            } else {
                bytesConsumed += kilobytesDownloaded;
                $bytesConsumed.text(bytesConsumed.toFixed(2));
                deductBalance(userRef, kilobytesDownloaded * 0.1);

                $urlContent.html(data);
            }
        });
    };

    $("#usernameForm").submit(function( event ) {
        event.preventDefault();
        username = $('#inputUserName').val();
        userRef = myFirebaseRef.child(username);

        //Initialise user if not already
        userRef.transaction(function (current_value) {
            return (current_value || 0);
        });

        //Listen to changes
        userRef.on('value', function (snapshot) {
            var newBalance = snapshot.val();
            if(newBalance > currentBalance) {
                alert("Received " + (newBalance - currentBalance).toFixed(2) + " BTC! Yaay");
            }
            currentBalance = newBalance;
            $userBalance.text(currentBalance.toFixed(2));
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
                    logToBlockchain(username + " sent " + btc + " BTC to " + receiver);
                    return (current_btc - btc);
                }
            });
            //Reset form
            $("#sendSatoshiForm")[0].reset();
        } else {
            alert("You cancelled the transaction");
        }

    });

    $urlContent.on('click', 'a, area', function(event) {
        event.preventDefault();
        var page = $(this).attr('href');
        loadUrlContent(page);
    });

    $("#start-session").click(function () {
        alert("We are beginning a session now. You will be charged 0.1 BTC for 1 Kb of data used.");
        logToBlockchain("t1 Transaction started between server and " + username);
        //Load home page
        loadUrlContent("articles.html");

        $("#stop-session").toggle();
        $("#start-session").toggle();
    });

    $("#stop-session").click(function () {
        var btcTransferred = bytesConsumed * 0.1;
        logToBlockchain("Server recieved " + btcTransferred + " BTC from " + username);
        logToBlockchain(username + " sent " + btcTransferred + " BTC to the Server. Current Balance: " + currentBalance + " BTC")

        alert("You spent " + btcTransferred.toFixed(2) + " in the current session. The page will now reload");
        location.reload();
    });

    $("#nav-links").find("a").click(function() {
        var navs = $("#nav-links").children();
        for(var i=0; i<navs.length; i++) {
            $(navs[i]).removeClass("active");

            var hrefAttr = $(navs[i]).find("a").attr("href");
            $(hrefAttr).hide();
            if (hrefAttr == this.hash) $(navs[i]).addClass("active");
        }
        $(this.hash).show();
    });

});

