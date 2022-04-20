var app = angular.module('digitalStopWatchApplication', []);

app.controller('stopWatchController', ['$scope', '$interval', 'stopWatchObject', 'localStorageObject','localStorageBaseObject', function ($scope, $interval, stopWatchObject, localStorageObject,localStorageBaseObject) {
    'use strict';
    var currentTimeObject = (new Date()).getTime() - (localStorageBaseObject.getDataGtr('initialTime')? localStorageBaseObject.getDataGtr('initialTime'): (new Date()).getTime() )
    $scope.isWatchRunning = localStorageBaseObject.getDataGtr('isWatchRunning')?localStorageBaseObject.getDataGtr('isWatchRunning'):false;
    $scope.startTime =0
    $scope.savedTime =0
    // get the laps data fromt he local storage. if no data create a blank array
    $scope.savedTimeArray = localStorageObject.getDataGtr()
        ? localStorageObject.getDataGtr()
        : []; 
    $scope.currentTimeObject = stopWatchObject.split((new Date()).getTime() - (localStorageBaseObject.getDataGtr('initialTime')? localStorageBaseObject.getDataGtr('initialTime'): (new Date()).getTime() ))

    $scope.showButton=false
    $scope.valueDate =   $scope.currentTimeObject
            // updates the timer
            $scope.updateStopWatchTime = function () {
                currentTimeObject += 1;
    
                // use factory function to split the timer into minutes, seconds an milliseconds
                // the factory function returns an object.
                $scope.currentTimeObject = stopWatchObject.split(currentTimeObject);
            };
      
    if ($scope.isWatchRunning) {
    $scope.durationTime = $interval($scope.updateStopWatchTime, 10);
    }

    // remove the lap from the lap list
    $scope.saveDataToLocalStorage = function () {
        localStorageObject.saveDataStr($scope.savedTimeArray);
    };


    var timeElapsed = function () {
        $scope.savedTime = stopWatchObject.split(currentTimeObject - $scope.startTime);
        $scope.startTime = currentTimeObject;
    };

    $scope.hoverIn = function(){
        $scope.hoverEdit = true;
    };
    
    $scope.hoverOut = function(){
        $scope.hoverEdit = false;
    };
    
    $scope.HandleClockEvent = function()
    {
        if($scope.isWatchRunning)
        {
            stopTheWatchFunction()
        }
        else
        {
            InitializeStopWatch()
        }
    }
    // starts the clock
    var InitializeStopWatch = function () {
        $scope.isWatchRunning = true;
        $scope.startTime = currentTimeObject;
        if(!localStorageBaseObject.getDataGtr('initialTime'))
            localStorageBaseObject.saveDataStr('initialTime',(new Date()).getTime());
        localStorageBaseObject.saveDataStr('isWatchRunning',true);  
  
        $scope.currentTimeObject = stopWatchObject.split((new Date()).getTime() - (localStorageBaseObject.getDataGtr('initialTime')? localStorageBaseObject.getDataGtr('initialTime'): (new Date()).getTime() ))

        // clear the interval
        if ($scope.durationTime) {
            $interval.cancel($scope.durationTime);
        }


        // set the interval
        $scope.durationTime = $interval($scope.updateStopWatchTime, 10);

    };

    // stopes the timer
    var stopTheWatchFunction = function () {
        $scope.isWatchRunning = false;
        localStorageBaseObject.saveDataStr('isWatchRunning',false);  
        if ($scope.durationTime) {
            $interval.cancel($scope.durationTime);
            // save the  time for future use (if the user hits the lap button after the stop)
            timeElapsed();
            $scope.startTime = currentTimeObject;

        }
    };

    // resets the timer
    $scope.resetTheWatchFunction = function () {
        currentTimeObject = 0;
        // clears the laps array
        $scope.savedTimeArray = [];
        $interval.cancel($scope.durationTime);
        // resets the view
        $scope.currentTimeObject= stopWatchObject.split(0)
        $scope.startTime = stopWatchObject.split(0);
        $scope.savedTime = stopWatchObject.split(0);
        $scope.isWatchRunning = false
        // clears the local storage
        localStorageObject.clearStorage();
        localStorageBaseObject.clearStorage('isWatchRunning')
        localStorageBaseObject.clearStorage('duration')
        localStorageBaseObject.clearStorage('initialTime')

    };

    // add the lap time to the lap array and the local storage
    $scope.incrementTimer = function () {
        if ($scope.isWatchRunning) {
            timeElapsed();
        }
        $scope.savedTimeArray.push($scope.savedTime);
        // adds to the local sotrage
        $scope.saveDataToLocalStorage();
    };

    // remove the lap from the lap list
    $scope.lapRemove = function (idx) {
        $scope.savedTimeArray.splice(idx, 1);
        // update the local storage
        $scope.saveDataToLocalStorage();
    };

}]);



// locla storage servive
app.factory('localStorageObject', function ($window, $rootScope) {
    'use strict';
    angular.element($window).on('storage', function (event) {
        if (event.key === 'digital-clicks') {
            $rootScope.$apply();
        }
    });

    return {
        saveDataStr: function (val) {
            var value = JSON.stringify(val);
            $window.localStorage.setItem('digital-clicks', value);
            return this;
        },
        getDataGtr: function () {
            var value = $window.localStorage.getItem('digital-clicks');
            return JSON.parse(value);
        },
        clearStorage: function () {
            return $window.localStorage.removeItem('digital-clicks');
        }
    };
});


// locla storage servive
app.factory('localStorageBaseObject', function ($window, $rootScope) {
    'use strict';
    angular.element($window).on('storage', function (event) {
        // if (event.key === 'current-state') {
            $rootScope.$apply();
        // }
    });

    return {
        saveDataStr: function (key,val) {
            var value = JSON.stringify(val);
            $window.localStorage.setItem(key, value);
            return this;
        },
        getDataGtr: function (key) {
            var value = $window.localStorage.getItem(key);
             return JSON.parse(value);;
        },
        clearStorage: function (key) {
            return $window.localStorage.removeItem(key);
        }
    };
});

// Factory Function that split the time into minutes, seconds and milliseconds and returns an name value pair object
app.factory('stopWatchObject', function () {
    'use strict';
    return {
        split: function (time) {
            var timeString = {
                miliSeconds: time % 100,
                seconds: Math.floor(time / 100) % 60,
                minutes: Math.floor(time / 6000)
            };

            if (timeString.minutes < 10) {
                timeString.minutes = '0' + timeString.minutes;
            }

            if (timeString.seconds < 10) {
                timeString.seconds = '0' + timeString.seconds;
            }

            if (timeString.miliSeconds < 10) {
                timeString.miliSeconds = '0' + timeString.miliSeconds;
            }

            return timeString;
        }
    };
});

