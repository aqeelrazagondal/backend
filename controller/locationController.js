const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
var GeoPoint = require('geopoint');
var GeoLib = require('geolib');
const _ = require('lodash');
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
//package to generate a random number
var randomize = require('randomatic');
const {User, validate} = require('../models/user');
const { Driver } = require('../models/driver');
const Location = require('../models/location');
const Rider  = require('../models/rider');
const mongoose = require('mongoose');
const geolib = require('geolib');
const express = require('express');
const logger = require('../startup/logging');
const regController = require('../controller/registrationController');
const NotificationController  = require('../controller/PushNotificationController');
var userExists = function(email, callback){
    logger.info('UserExists Method Called');
    var query = { email };
    User.findOne(query).exec(function(err, email){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (email){
                logger.info('User Found with Email. :'+email);                
                console.log("user found with Email. :"+email);
                callback (email);
            }
            else{
                logger.info('User Not Found with Email. :'+email);
                console.log("user not found with EMail. :"+email);
                callback( email);
            }
       }
     });
    logger.info(' Exit UserExists Method');
}
var locationExists = function(id,callback){

    logger.info('markerExists Method Called');
    var query = { _id : id };
    Location.findOne(query).exec(function(err, location){
        if (err){
            logger.error('Some Error while finding Location' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (location){                
                logger.info('Marker Found with id :'+id);
                callback (location);
            }
            else{                
                 logger.info('Marker Not Found with id :'+id);
                callback( location);                
            }
       }
    });
    
    logger.info(' Exit MarkerExists Method');
}



async function inRadiusNotification(user, riderId, location){


    if (location){

        var distance = geolib.getDistance(
            user.loc,
            location.loc
            );
            logger.info ('*distance between driver and rider pick up loc: '+ location.title +' is :'+ distance);
            
            //Check if distance is less then defined radius
            
            if (distance<location.radius)
            {
                //inside Radius, Send Push Notification
                logger.info ('***inside Radius, Send Push Notification');   
                let rider = await Rider.findOne({ _id: riderId });
                if(!rider) return res.jsonp  ({ status: 'failure', message: 'Rider not found by userID', object: [] });
                logger.info('Sending Notification to One signal  id ' + rider.onesignalid );
                logger.info('Loc Object : long  = ' + location.loc[0] + "** lat =" +  location.loc[1] + "** radius =" + location.radius);
                //logger.info('Individual Conversation msg  before Push Notification:'  );		
               var message = "Bus is near your pick up Location";

               if (rider.last_notification_time){
                var difference_ms = new Date() - rider.last_notification_time;
                logger.info('Difference in ms is : ' + difference_ms);
                if (difference_ms>1800000){
                    logger.info('Notifcation Sent 3 min before');
                    NotificationController.sendNotifcationToPlayerId(rider.onesignalid,message);
                    rider.last_notification_time= new Date();
                }else{
                    logger.info('Notifcation Sent in less then 3 min');
                }
               }else {
                logger.info ('Sending Location For First Time');   
                NotificationController.sendNotifcationToPlayerId(rider.onesignalid,message);
                rider.last_notification_time= new Date();
               }
               
            }else{
                logger.info ('**Distance: '+distance + 'is greater then radius ' + location.radius);  
            }
    }

        		
}


async function inEndLocRadiusNotification(user, riderId, location){


    if (location){

        var distance = geolib.getDistance(
            user.loc,
            location.loc
            );
            logger.info ('*distance between driver and rider pick up loc: '+ location.title +' is :'+ distance);
            
            //Check if distance is less then defined radius
            
            if (distance<location.radius)
            {
                //inside Radius, Send Push Notification
                logger.info ('***inside Radius, Send Push Notification');   
                let rider = await Rider.findOne({ _id: riderId });
                if(!rider) return res.jsonp  ({ status: 'failure', message: 'Rider not found by userID', object: [] });
                logger.info('Sending Notification to One signal  id ' + rider.onesignalid );
                logger.info('Loc Object : long  = ' + location.loc[0] + "** lat =" +  location.loc[1] + "** radius =" + location.radius);
                //logger.info('Individual Conversation msg  before Push Notification:'  );		
               var message = "Bus is near your pick up Location";

               if (rider.last_notification_time){
                var difference_ms = new Date() - rider.last_notification_time;
                logger.info('Difference in ms is : ' + difference_ms);
                if (difference_ms>1800000){
                    logger.info('Notifcation Sent 3 min before');
                    NotificationController.sendNotifcationToPlayerId(rider.onesignalid,message);
                    rider.last_notification_time= new Date();
                }else{
                    logger.info('Notifcation Sent in less then 3 min');
                }
               }else {
                logger.info ('Sending Location For First Time');   
                NotificationController.sendNotifcationToPlayerId(rider.onesignalid,message);
                rider.last_notification_time= new Date();
               }
               
            }else{
                logger.info ('**Distance: '+distance + 'is greater then radius ' + location.radius);  
            }
    }

        		
}


exports.riderPickUPLocation = async function(reqData, res){
    try {
        let userObj;
        let userResObj;
        let listOfDrivers = [];

        logger.info("IN Riderpickuploaction");
        let phone = reqData.phoneNo;
        let longitude = reqData.longitude;
        let latitude = reqData.latitude;
        let radius = reqData.radius;
 

        let user = await User.findOne({ phone });
        if(!user) return res.jsonp({ status: "failure", message: "Failed To Finding rider!", object: [] });
        console.log('Found a user', user);

        let location = new Location({
            loc: [latitude, longitude ],
            radius: radius
        });
        await location.save();
        console.log('Location saved', location);

        let query =  user._id;
        console.log('query', query);

        let rider = await Rider.findOne({ _userId: user._id });
        if(!rider) return res.jsonp({ status: 'failure', message: 'Rider not found by userID', object: [] });

        rider._pickUpLocationId = location._id;
        
        await rider.save();
        console.log('Rider saved!', rider);

        res.jsonp({
            status: "success",
            message: "riderPickUPLocation Updated!",
            object: []
        });
        
    } catch (err) {
        logger.info('An Exception Has occured in RiderPickUpLocation method' + err);
    }
}

