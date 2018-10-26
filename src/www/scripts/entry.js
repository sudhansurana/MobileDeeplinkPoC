var MxApp = require("mendix-hybrid-app-base");

MxApp.onConfigReady(function(config) {
    // Perform any custom operations on the dojoConfig object here
    config.afterNavigationFn = function() {
        console.info("Running Eric's custom afterNavigation function");

        //add a listener now for deep links
        //any time they come in now, we'll be ready to handle them
        universalLinks.subscribe(null, function(eventData) {
            // do some work
            console.log('Did launch application from the link: ' + eventData.url);
            var oReq = new XMLHttpRequest();
            /* use a PUT to get responses from DL without redirects
             * 200 means it's ready
             * 401 means you're not logged in
             * 404 means not found
             */
            oReq.open("put", eventData.url, true);
            //detect if iOS for handle deeplink
            if (device.platform === 'iOS' || device.platform === 'Android') {
                var pid = mx.ui.showProgress("Loading link...");
                oReq.onreadystatechange = function () {
                    if(oReq.readyState === 4) {
                        if(oReq.status === 200) {
                            mx.data.action({
                                params: {
                                    actionname: "System.ShowHomePage"
                                },
                                origin: mx.ui.getContentForm(),
                                callback: function() {
                                    mx.ui.hideProgress(pid);
                                },
                                error: function(error) {
                                    mx.ui.hideProgress(pid);
                                    mx.ui.error("Unable to load link. Please try again.");
                                }
                            });
                        } else if (oReq.status === 401) {
                            //we weren't redirected (got a 200) and instead were sent to a login page. Show an error
                            mx.ui.hideProgress(pid);
                            mx.ui.error("Sorry, you need to be logged in to view this link. Please log in and try again");
                        } else {
                            //something else went wrong
                            mx.ui.hideProgress(pid);
                            mx.ui.error("Sorry, something went wrong with the link.");
                        }
                    }
                };
            }
            oReq.send();
        });
        //these lines are from the original afterNavigationFn, which we're overriding
        /*
        * If defined, this function is invoked in onNavigation method,
        * called as the last action during the startup. Lines below handle
        * removal of the loading nodes.
        */
        var removeSelf = function() {
            var appNode = document.getElementById("mx-app");
            if (appNode) appNode.style.display = "none";
        };
        removeSelf();
    }

});

MxApp.onClientReady(function(mx) {
    
});

// Uncomment this function if you would like to control when app updates are performed
/*
MxApp.onAppUpdateAvailable(function(updateCallback) {
    // This function is called when a new version of your Mendix app is available.
    // Invoke the callback to trigger the app update mechanism.
});
*/