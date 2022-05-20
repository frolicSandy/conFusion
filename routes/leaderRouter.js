const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const authenticate=require('../authenticate');

const Leaders=require('../models/leaders');

const leaderRouter=express.Router();

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
// .all((req,res,next)=>{
//     res.statusCode=200;
//     res.setHeader('Content-Type','text/plain');
//     next();
// })
.get((req,res,next)=>{
    // res.end('Will send all the leaders to you!');
    Leaders.find({})
        .then((leaders)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leaders);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    // res.end('Deleting all the leaders!');
    Leaders.remove({})
        .then((leaders)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leaders);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    // res.end('Will add the leader: '+req.body.name+' with details: '+req.body.description);
    Leaders.create(req.body)
        .then((leaders)=>{
            console.log('Leader Created ', leaders);
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leaders);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /leaders');
});

leaderRouter.route('/:leaderId')
.get((req,res,next)=>{
    // res.end('Will send details of the leader: '+req.params.leaderId+' to you!');
    Leaders.findById(req.params.leaderId)
        .then((leader)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    // res.end('Deleting leader: '+req.params.leaderId);
    Leaders.findByIdAndRemove(req.params.leaderId)
        .then((leaders)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leaders);
        }, (err)=>next(err))
        .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /leaders/'+req.params.leaderId);
})
.put(authenticate.verifyUser, (req,res,next)=>{
    // res.write('Updating the leader: '+req.params.leaderId+'\n');
    // res.end('Will update the leader: '+req.body.name+' with details: '+req.body.description);
    Leaders.findByIdAndUpdate(req.params.leaderId, {
        $set: req.body
    }, {new: true})
        .then((leader)=>{
            console.log('Leader Updated ', leader);
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(leader);
        }, (err)=>next(err))
        .catch((err)=>next(err));
});

module.exports=leaderRouter;