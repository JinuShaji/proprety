var express = require('express');
// const app = require('../app');
var router = express.Router();
var con=require('../config/config');
/* GET users listing. */
router.get('/', function(req, res, next) {
  var sql="select * from product"
  var sql2="select userMail, count(*) as total FROM cart where userMail=?;"
  if(req.session.user){
    var email=req.session.user.email;
    }
    var user=req.session.user;
  con.query(sql,(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      console.log(result)

        let product = result;
      con.query(sql2,[email],(err,result)=>{
        if(err){
          console.log(err)
        }
        else{
            var CartTotal = result[0].total;
          console.log(result)
          console.log("products===============",product)
          console.log(CartTotal)
          res.render('user/home',{product,user,CartTotal});
        }
      
      })
    }
  })
});
router.get('/userLogin',function(req,res,next){
  res.render("user/userLogin",{homepage:true})
})
router.get('/userReg',function(req,res,next){
  var msg=""
  res.render("user/userReg",{msg,homepage:true})
})
router.get("/cart/:mail",(req,res)=>{
sql="SELECT product.Product_name,product.Price,product.Image,product.Description,product.id,cart.userMail, cart.qnty,cart.Id FROM product INNER JOIN cart ON product.id = cart.Product_id AND cart.userMail=?;"
con.query(sql,[req.params.mail],(err,result)=>{
  if(err){
    console.log(err)
  }
  else{
    console.log(result)
    var user=req.session.user;
    console.log(result)
    res.render('user/cart',{homepage:true,product:result,user})
  }
})


})
router.post('/Ulogin',(req,res)=>{
  console.log(req.body);
  var email=req.body.email;
  var pass=req.body.password;
  var sql="select * from user where email=? and pass=?"
  con.query(sql,[email,pass],(err,result)=>{
    if(err){
      console.log(err);
    }
    else{
      if(result.length > 0){
          console.log("login successfull")
          req.session.user=result[0];
          console.log("session", req.session.user)
          res.redirect('/users')
      }else{
        console.log("login error")
      }
    }
  })
})
  // console.log(req.body.mail)
router.post('/Ureg',(req,res)=>{ 
  console.log(req.body);
data=req.body;
var email=req.body.email;
var sql1="select * from user where email=?"
var sql2="insert into user set ?"
con.query(sql1,[email],(err,result)=>{
  if(err){
    console.log(err)
  }
  else{
    if(result.length>0){
      console.log("This email id has been already taken.")
      var msg="This email id has been already taken."
      res.render('user/userReg',{msg,homepage:true})
    }
    else{
      con.query(sql2,data,(err,result)=>{
        if(err){
          console.log(err)
        } 
        else{
          var msg="Login to continue"
          console.log("success")
          res.render('user/userReg',{msg,homepage:true})
        }
      })
    }
  }
})
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/users')
})
router.get('/update/:email',(req,res)=>{
  var email=req.params.email;
  console.log(email);
  var sql="select * from user where email= ?"
  con.query(sql,[email],(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      var userData=result[0];
      res.render('user/userEdit',{userData})
    }
  })
})
router.post('/updateInfo',(req,res)=>{
  var data=req.body;
  console.log(data);
  var id=req.body.id;
  var sql2=`update user set ? where id=${id}`
  con.query(sql2,data,(err,result)=>{
    if(err){
      console.log(err)
    }
    else{
      var sql3=`select * from user where id=${id}`
      con.query(sql3,(err,row)=>{
        if(err){
          console.log(err)
        }
        else{
          req.session.user=row[0];
          res.redirect('/users/')
        }
       
      })
     
    }
  }) 
})
router.get("/addtoCart/:Pid",(req,res)=>{
  var Pid=req.params.Pid;
  var email=req.session.user.email;
  var qdata;
 sql  = "select * from cart where userMail= ? and Product_id= ?";
 sql2 = "update cart set qnty = ? where userMail = ? and Product_id= ?";
 sql3 = "  INSERT INTO cart (userMail, Product_id) VALUES (?,?);"
 con.query(sql,[email,Pid],(err,result)=>{
              if(err){
                  console.log(err)
              }else{
                if(result.length>0){
                  console.log("this product is already added");
                  console.log(result);
                    qdata = result[0].qnty + 1;
                    con.query(sql2,[qdata,email,Pid],(err,result)=>{
                      if(err){
                        console.log(err)
                      }else{
                        res.redirect('/users/')
                      }
                    })
                  

                }else{
                  console.log("cart not added")
                  con.query(sql3,[email,Pid],(err,result)=>{
                    if(err){
                      console.log(err)
                    }else{
                      res.redirect('/users/')
                    }
                  })


                }
              }
 })

})


router.get("/delete/:Pid",(req,res)=>{
  var Pid=req.params.Pid;
  var email=req.session.user.email;
  console.log(Pid)
  console.log(email)
 sql="delete from cart where id=? and userMail=?";
 con.query(sql,[Pid,email],(err,result)=>{
   if(err){
     console.log(err)
   }
   else{
     console.log("deleted")
    res.redirect('/users/')
   }
  })
})

router.get("/placeOrder/:Pid",(req,res)=>{
  var Pid=req.params.Pid;
  var email=req.session.user.email;
  var user=req.session.user;
  console.log(Pid)
  console.log(email)
  var total;
  sql="SELECT product.Product_name,product.Price,product.Image,product.Description,product.id,cart.qnty FROM product INNER JOIN cart ON product.id = cart.Product_id where userMail=? and Product_id=?;"
  con.query(sql,[email,Pid],(err,result)=>{
   if(err){
     console.log(err)
   }
   else{
     total=result[0].Price * result[0].qnty;
    res.render('user/pay',{homepage:true,user,product:result[0],total})
   }
  })
})
router.get('/paymentcart/:total/:id',(req,res)=>{
  var amount=req.params.total;
  var product_id=req.params.id;
  var userMail=req.session.user.email;
  var user=req.session.user;
  sql="INSERT INTO orders (userMail, product_id,amount) VALUES (?,?,?)";
  sql2="select * from orders where userMail=? and product_id=?";
  con.query(sql,[userMail,product_id,amount],(err,result)=>{
   if(err){
     console.log(err)
   }else{


     console.log("inserted in orders");
     con.query(sql2,[userMail,product_id],(err,row)=>{
       if(err){
         console.log(err)
       }else{
         console.log(row)
         res.render('user/payment',{homepage:true,user,amount})
       }
     })
     
   }
  })
})



router.get('/paymentcart2/:total/:id',(req,res)=>{
  var amount=req.params.total;
  var product_id=req.params.id;
  var userMail=req.session.user.email;
  var user=req.session.user;
  sql="INSERT INTO orders (userMail, product_id) VALUES (?,?)";
  sql2="select * from orders where userMail=? and product_id=?";


  con.query(sql,[userMail,product_id,amount],(err,result)=>{
   if(err){
     console.log(err)
   }else{
     console.log("inserted in orders");
     con.query(sql2,[userMail,product_id],(err,row)=>{
      if(err){
        console.log(err)
      }else{
        console.log(row)
        console.log(result)
        var id=row[0].id;
        res.render('user/payment2',{homepage:true,user,amount,id })
      }
    })
    
   }
  })
})
router.get("/myorder/:mail",(req,res)=>{
  var mail=req.session.user.email;

  sql="SELECT product.Product_name,product.Price,product.Image,orders.amount FROM product INNER JOIN orders ON product.id = orders.Product_id AND orders.userMail=?;"
  con.query(sql,[mail],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      console.log(result)
      res.render('user/myorder',{homepage:true,product:result})
    }
  })


})
router.get('/addpost/:mail',function(req,res){
  console.log(req.params.mail)
  
  res.render('user/addpost',{homepage:true})
})

router.post('/addpost',(req,res)=>{
  console.log(req.files.uploaded_image)
  var file=req.files.uploaded_image;
var image_name = file.name;
let sql="INSERT INTO addpost SET ?";
var mail=req.session.user.email;
console.log(file)
console.log(image_name);
if(file.mimetype =="image/jpeg" || file.mimetype =="image/png" || file.mimetype =="image/gif"
){
  file.mv("public/images/post/"+file.name,function(err){
    if(err) return res.status(500).send(err);
    console.log(image_name);

let data={
 
  name:req.body.name,
  discription:req.body.description,
  image:image_name,
  userID:mail
}; 
console.log(data)
con.query(sql,data,(err,result)=>{
  if(err){
    console.log(err)
  }else{
    res.redirect('/users/')
  }
})
}) 
} 
 
})
router.get('/feed',(req,res)=>{
  sql="select * from addpost";
  con.query(sql,(err,result)=>{
    if(err){
      console.log(err)
    }else{
      console.log(result)
      res.render('user/feed',{homepage:true,product:result})
    }
  })
  
})
router.post('/updatepay/:id/:amount',(req,res)=>{
  var id=req.params.id;
  var amount=req.params.amount;
  sql="update orders set amount = ? where  userMail= ? and id = ? "
  con.query(sql,[amount,req.session.user.email,id],(err,result)=>{
    if(err){
      console.log(err)
    }else{
      res.redirect('/users/')
    }
  })



})

module.exports = router;
