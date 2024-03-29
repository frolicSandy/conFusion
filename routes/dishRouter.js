const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const authenticate=require('../authenticate');

const Dishes=require('../models/dishes');

const dishRouter=express.Router();

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.get((req,res,next)=>{
    // res.end('Will send all the dishes to you!');
    Dishes.find({})
        .populate('comments.author')
        .then((dishes)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dishes);
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    // res.end('Deleting all the dishes!');
    Dishes.remove({})
        .then((resp)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    // res.end('Will add the dish: '+req.body.name+' with details: '+req.body.description);
    Dishes.create(req.body)
        .then((dish)=>{
            console.log('Dish Created ',dish);
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /dishes');
});

dishRouter.route('/:dishId')
.get((req,res,next)=>{
    // res.end('Will send details of the dish: '+req.params.dishId+' to you!');
    Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish)=>{
            console.log('Dish Created ',dish);
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    // res.end('Deleting dish: '+req.params.dishId);
    Dishes.findByIdAndRemove(req.params.dishId)
        .then((resp)=>{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        },(err)=>next(err))
        .catch((err)=>next(err));

})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    // res.write('Updating the dish: '+req.params.dishId+'\n');
    // res.end('Will update the dish: '+req.body.name+' with details: '+req.body.description);
    Dishes.findByIdAndUpdate(req.params.dishId, {
        $set: req.body
    }, {new: true})
        .then((dish)=>{
            console.log('Dish Created ',dish);
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish);
        },(err)=>next(err))
        .catch((err)=>next(err));
});

dishRouter.route('/:dishId/comments')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish)=>{
            if(dish!=null){
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish.comments);
            }
            else{
                err=new Error('Dish '+req.params.dishId+' not found!');
                err.status=404;
                return next(err);
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    // res.end('Deleting all the dishes!');
    Dishes.findById(req.params.dishId)
        .then((dish)=>{
            if(dish!=null){
                for(var i=(dish.comments.length-1);i>=0;i--){
                    dish.comments.id(dish.comments[i]._id).remove();
                }
                dish.save()
                    .then((dish) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(dish);                
                    }, (err) => next(err));
            }
            else{
                err=new Error('Dish '+req.params.dishId+' not found!');
                err.status=404;
                return next(err);
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    // console.log("Will add the comment "+req.body);
    Dishes.findById(req.params.dishId)
        .then((dish)=>{
            if(dish!=null){
                // console.log(dish.toJSON());
                req.body.author = req.user._id;
                dish.comments.unshift(req.body);
                dish.save()
                    .then((dish)=>{
                        Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then((dish) => {
                                res.statusCode=200;
                                res.setHeader('Content-Type','application/json');
                                res.json(dish);
                            })
                    }, (err)=>next(err));
            }
            else{
                err=new Error('Dish '+req.params.dishId+' not found!');
                err.status=404;
                return next(err);
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+' /comments');
});

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next)=>{
    // res.end('Will send details of the dish: '+req.params.dishId+' to you!');
    Dishes.findById(req.params.dishId)
        .populate('comments.author')
        .then((dish)=>{
            if(dish!=null && dish.comments.id(req.params.commentId)!=null){
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish.comments.id(req.params.commentId));
            }
            else if(dish==null){
                err=new Error('Dish '+req.params.dishId+' not found!');
                err.status=404;
                return next(err);
            }
            else{
                err=new Error('Comment '+req.params.commentId+' not found!');
                err.status=404;
                return next(err);
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
        .then((dish)=>{
            var id1=req.user._id;
            // console.log(id1);
            var d=dish.toJSON();
            console.log(d);
            for(var i=(d.comments.length-1);i>=0;i--){
                var id2=d.comments[i].author.toString();
                if(id1.equals(id2)){
                    if(dish!=null && dish.comments.id(req.params.commentId)!=null){
                        dish.comments.id(req.params.commentId).remove();
                    dish.save()
                        .then((dish)=>{
                            Dishes.findById(dish._id)
                            .populate('comments.author')
                            .then((dish) => {
                                res.statusCode=200;
                                res.setHeader('Content-Type','application/json');
                                res.json(dish);
                            })
                        },(err)=>next(err));
                    }
                    else if(dish==null){
                        err=new Error('Dish '+req.params.dishId+' not found!');
                        err.status=404;
                        return next(err);
                    }
                    else{
                        err=new Error('Comment '+req.params.commentId+' not found!');
                        err.status=404;
                        return next(err);
                    }
                    break; 
                }
                else if(i===0){
                    var err=new Error('You are not authorized to perform this action!');
                    err.status=403;
                    next(err);
                }
            }
            // console.log(id2);

        },(err)=>next(err))
        .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
        .then((dish)=>{
            var id1=req.user._id;
            for(var i=(dish.comments.length-1);i>=0;i--){
                var id2=dish.comments[i].author.toString();
                if(id1.equals(id2)){
                    res.statusCode=403;
                    res.end('POST operation not supported on /dishes/'+req.params.dishId+'/comments/'+req.params.commentId);
                    break;
                }
                else if(i===0){
                    var err=new Error('You are not authorized to perform this action!');
                    err.status=403;
                    next(err);
                }
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
        .then((dish)=>{
            var id1=req.user._id;
            for(var i=(dish.comments.length-1);i>=0;i--){
                var id2=dish.comments[i].author.toString();
                if(id1.equals(id2)){
                    if(dish!=null && dish.comments.id(req.params.commentId)!=null){
                        if(req.body.rating){
                            dish.comments.id(req.params.commentId).rating=req.body.rating;
                        }
                        if(req.body.comment){
                            dish.comments.id(req.params.commentId).comment=req.body.comment;
                        }
                        dish.save()
                            .then((dish)=>{
                                Dishes.findById(dish._id)
                                    .populate('comments.author')
                                    .then((dish) => {
                                        res.statusCode=200;
                                        res.setHeader('Content-Type','application/json');
                                        res.json(dish);
                                    })
                            }, (err)=>next(err));
                    }
                    else if(dish==null){
                        err=new Error('Dish '+req.params.dishId+' not found!');
                        err.status=404;
                        return next(err);
                    }
                    else{
                        err=new Error('Comment '+req.params.commentId+' not found!');
                        err.status=404;
                        return next(err);
                    }
                    break;
                }
                else if(i===0){
                    var err=new Error('You are not authorized to perform this action!');
                    err.status=403;
                    next(err);
                }
            }
        },(err)=>next(err))
        .catch((err)=>next(err));
});

module.exports=dishRouter;