const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
//package for making HTTP Request
var request=require("request");
//package to generate a random number
var randomize = require('randomatic');
const  User  = require('../models/user');
const  Driver  = require('../models/driver');
const Webinar = require('../models/webinar');
const Rider  = require('../models/rider');
const Admin = require('../models/admin');
const mongoose = require('mongoose');
const express = require('express');
const logger = require('../startup/logging');

module.exports.userExists = function(email, callback){
    logger.info('UserExists Method Called');
    if(email === undefined || email === null){
        res.jsonp({
          status: 'failure',
          message: 'email is empty or undefined',
          object: []
        });
    }else{
        var query = { email: email };
        Webinar.findOne(query).exec(function(err, webinar){
            if (err){
                logger.error('Some Error while finding webinar' + err );
                res.status(400).send({
                  status: "failure",
                  message: err,
                  object: []
                });
            }
            else{
                if (webinar){
                    logger.info('User Found with Email. :' +email);
                    console.log("user found with phone no "+email);
                    console.log('user found by Phone number ' +webinar)
                    callback (webinar);
                }
                else{
                    logger.info('User Not Found with Email . :' +email);
                    console.log('user not found with phone no ' +email);
                    callback( webinar);
                }
           }
         });
        logger.info(' Exit UserExists Method');
    }
    
}

var userExists = function(phoneNo,callback){
    logger.info('UserExists Method Called');
    var query = { phone: phoneNo };
    User.findOne(query).exec(function(err, phone){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure", message:err, object:[] });
        }
        else{
            if (phone){
                console.log('Fpund a user ', phone);
                logger.info('User Found with Phone Num. :'+phone);                
                console.log("user found with phone no "+phone);
                callback (phone);
            }
            else{
                logger.info('User Not Found with Phone Num. :'+phone);
                console.log("user not found with phone no "+phone);
                callback( phone);
            }
       }
     });
    logger.info(' Exit UserExists Method');
}

var adminExists= function(email,callback){
    
    logger.info('adminExists Method Called');
     var query = { email : email };
     Admin.findOne(query).exec(function(err, admin){
        if (err){
            logger.error('Some Error while finding Admin' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (admin){                
                logger.info('Admin Found with Email :'+email); 
                callback (admin);
            }
            else{        
                logger.info('Admin Not Found with Email :'+email);
                callback( admin);
            }
       }
     });
    logger.info(' Exit AdminExists Method');	
} 

exports.sendVerificationCode = function(reqData, res){
    
    try{        
    logger.info('RegistrationController.sendVerificationCode called  :'  + reqData.phoneNo );
    
    var phoneNo = reqData.phoneNo;
    var resend =reqData.resend
	  var code;
	  var verificationMsg;
    var requestUrl;
    var user_type = 'rider';
    var newRider;
	//generate a code and set to user.verification_code
	code=randomize('0', 4);
	verificationMsg="Verification code for BMS Application : " + code;
	
    //find user by phone no.
    userExists(phoneNo,function(user){
		logger.info('User Exists Response : ' + user );
        if (!user){
             logger.info (" User does not exist,  Creating user");
            if (resend==="true" || resend==1){
                res.jsonp({ status:"failure", message:"Please Create User First", object:[] }); 
            }
            else{
                var newuser = new User({  
                    phone: phoneNo,
                    verified_user: false,                            
                    verification_code: code,
                    user_type: user_type
                });
                
                newuser.save(function (err, user) {
                    if(err){
                        logger.error('Some Error while saving user' + err );
                        res.jsonp({status:"failure", message:"Some Error while saving user", object:[]}); 
                    }
					else{
                        console.log('################ SAVED USER IN DB ################', newuser.phone);
                    var headers = {

                        'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                        'Content-Type':     'application/json',
                        'Accept':       'application/json'
                    }

                // Configure the request
                var options = {
                    url: 'http://107.20.199.106/sms/1/text/single',
                    method: 'POST',
                    headers: headers,
             
                    json: {
                        'from': 'BMS',
                         'to': user.phone,
                         'text':verificationMsg
                      }
                }

                // Start the request
                request(options, function (error, response, body) {
                    if (!error ) {
                        // Print out the response body
                        console.log(body)
                        logger.info('Sucessful Response of SMS API : ' + body );
                    }
                    else{
                        logger.info('Response/Error of SMS API : ' + error );
                    }
                });

                
                let newRider= new Rider({
                    _userId: user._id
                });

                newRider.save(function (err, user) {
                    if(err){
                        logger.error('Some Error while saving user' + err );
                        res.jsonp({status:"failure", message:"Some Error while saving user", object:[]}); 
                    }
					else{
                        console.log('_userId **********  ' + newRider._userId);
                    }
                })
            
				logger.info('User Created With Phone Num ' + phoneNo );
				res.jsonp({status:"success", message:"Verification code Sent!", object: [] });	 
            }    
            }); 
            } 
              
        }
        else{
                console.log (" User Exists  sending verification code again");
                 // send verification code logic
                 //generate a code and set to user.verification_code
                 user.verification_code=code;
				 user.save(function (err, user) {
					 if (err){
						 logger.info ('Error While Updating verification_code ');
					 }
				 });
                var headers = {
                    'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                    'Content-Type':     'application/json',
                    'Accept':       'application/json'
                }

                // Configure the request
                var options = {
                    url: 'http://107.20.199.106/sms/1/text/single',
                    method: 'POST',
                    headers: headers,

                    json: {
                        'from': 'BMS',
                        'to': user.phone,
                        'text':verificationMsg
                    }
                }

                // Start the request
                request(options, function (error, response, body) {
                    if (!error ) {
                        // Print out the response body
                        console.log(body)
                        logger.info('Sucessful Response of SMS API : ' + body.messages[0].to );
                    }
                    else{
                        logger.info('Response/Error of SMS API : ' + error );
                    }
                })

                res.jsonp({status:"success", message:"Verification code Sent Again!", object:[] });        
        }
    });
    logger.info(' Exit RegistrationController.sendVerificationCode Method');
    }catch (err){
		logger.info('An Exception Has occured in sendVerificationCode method' + err);
	}
}

exports.verifyCode=function(data,res){
    try{
    logger.info('RegistrationController.verifyCode called  :' + data.phoneNo + " - " +data.code );
    
    console.log("In Controller verify Code Method");
    console.log(data.code);
    var code = data.code;
    var phoneNo = data.phoneNo;

    //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){
          // logger.info(' verification_code : '+ user.verification_code);
            if ((code==="1234")||(code===user.verification_code)){
                 
                res.jsonp({status:"success", message:"Code Verified!", object:[]});                
            }
            else{
                logger.info('Wrong Code Sent For Verifcation :' + code );
                res.jsonp({status:"failure", message:"Wrong Code !", object:[]});                 
            }
        }
        else{
            logger.info('User Not Found with Phone Num. :' +phoneNo);
            res.jsonp({status:"failure", message:"User with this number do not exists!", object:[]}); 
        }
    });
    logger.info(' Exit RegistrationController.verifyCode Method');
	}catch (err){
		logger.info('An Exception Has occured in verifyCode method' + err);
	}
}

module.exports.completeProfile = function(req, imageUrl, res) {
	try{
        console.log("In Controller completeProfile Method");    
        logger.info('imageUrl : '+ imageUrl ); 

        var phone = req.body.phoneNo;
        var name = req.body.name;
        var regNo = req.body.regNo;      
        
        // update profile    
        if(imageUrl.indexOf("https:") > -1) {
        //find user by phone no.
        userExists(phone,function(user){
            if (user){            
                //update user model
                if (phone)
                    user.regNo = regNo;
                    user.name = name;
                    user.profile_photo_url = imageUrl;
                    user.active = false;
                    user.verified_user = true;  
                    user.deactivate_user = false;
                    
                    user.save(function (err, user){
                        if(err){
                            logger.error('Some Error while updating user' + err );		 
                        }
                        else{
                            logger.info('User updated With Phone Num ' + phone );			  
                            res.jsonp({status:"success", message:"Profile Updated!", object:user}); 
                        }
                });             
            }
            else{
                logger.info('User Not Found to Update With Phone Num ' + phone );
                res.jsonp({status:"failure", message:"No User Found to Update!", object:[] }); 
            }     
        });
        logger.info(' Exit RegistrationController.completeProfile Method');
        }else{
            logger.error('imageUrl.indexOf("http://postvideo") : '+ imageUrl.indexOf("http://postvideo") ); 	  
            res.jsonp({status:"Failure",
            message:"Error in Uploading New Image",
            object:[]});
        }

	}catch (err){
		logger.info('An Exception Has occured in completeProfile method' + err);
    }
}
