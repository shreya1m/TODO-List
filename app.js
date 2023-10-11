const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));//in list.ejs we provide relative path to public folder
 const url="mongodb+srv://shreyanarayan062:Shreya12@cluster0.p3gkgmo.mongodb.net/todoDB";

 
mongoose.connect(url,{
  useNewUrlParser : true,
  useUnifiedTopology :true,
});
4
const itemSchema={
         name:String
};
const Item=mongoose.model("Item",itemSchema);//collection name Item (bracket ke ander wala item na ki const item keyword),our schema

const item1= new Item({
    name:"Welcome to your To-Do List!"
});
const item2= new Item({
    name:"So..Start adding your To-Do items :)"
});


//schema for list
const listSchema = {   
  name: String,
  items: [itemSchema]
  };

  //model
  const List=mongoose.model("List",listSchema);//model=collection


//for adding or inserting elements to our database and home route todo list
app.get("/", function(req, res){//only get function redirect to us at routes not post it is for getting FORMS output or post value
  Item.find().then(function(foundItems){
      if (foundItems.length === 0) {
        Item.insertMany([item1,item2]).then(function(){
          console.log("Succesfully saved all the items to todolistDB");
        })
        .catch(function (err) {
          console.log(err);
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });
});

//for creating custom list if not exists(i.e in if part) is exists then just render that list (i.e in else part)
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: [item1,item2],
        });
        list.save();
        res.redirect("/" + customListName);
      } 
      else {
        //else show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});
// app.get("/", function(req, res) {

//   Item.find().then(function(foundItems){
 
//   if(foundItems.length === 0)//checking this so that only once we enter this default items else as many times you run it will print default items.
//   {
//     //inserting elements
//    Item.insertMany(defaultItems).then(function(){
//     console.log("Successfully saved into our todoDB.");
//   })
//   .catch(function(err){
//     console.log(err);
//   });
//    res.redirect("/");//we r redirecting bcoz first when server will come to home(/)then it will check condition that defaultitems.length===0 or not it is not then it will enter elements then if u dont redirect it again then else will not run and in else only we have find bcoz in redirect run 
//    //it will get if condition false run then else block.
//   }

//   else
//   {
// //finding elements or simply getting elemnents 
//   res.render("list", {listTitle: "Today", newListItems: foundItems});
// }
// });
// });






//old way where database is not used starts here
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

// app.get("/", function(req, res) {

// //const day = date.getDate();

//   res.render("list", {listTitle: "Today", newListItems: items});

// });


app.post("/", function(req, res)//this take post from "form" and allows us to take input in req.body. to get that data then it is redirecting to home("/") route
{

const itemName = req.body.newItem;
const listName= req.body.list.trim();

const item=new Item({//here inserting user enter value in new item i.e what we add in todo list
  name:itemName 
});


 if (listName==="Today")//here we r inserting new items in today list
{
  item.save();//saving item in todoDB
  res.redirect("/");//redirecting so that this new user added item get by redirecting it to "/" home route where with the help of find function.
}

//here we r inserting new item in custom list
else{
  List.findOne({name:listName})
  .then(function (foundListName) {
    foundListName.items.push(item);
    foundListName.save();
  res.redirect("/" + listName);
}).catch(function (err) {
  console.log(err);
});
}
});

//removing checked item from todolist
app.post("/delete",function(req,res)
{
   let  checkedItemId=req.body.checkbox.trim();
   let hiddenListName=req.body.hiddenItemName.trim();

   if(hiddenListName==="Today"){

   Item.findByIdAndRemove(checkedItemId).then(function(){
        console.log("Successfully removed checked item.");
      })
      .catch(function(err){
        console.log(err);
})
   }
   //else when it is custom list ..so this else is for finding the list then deleting(or updating) custom list item.
   else{
    List.findOne({ name: hiddenListName })
      .then((foundList) => {
        if (foundList) {
          foundList.items.pull({ _id: checkedItemId });
          return foundList.save();
        }
      })
      .then(() => {
        console.log("We have removed the item with id: " + checkedItemId + " from " + hiddenListName + " list");
        res.redirect("/" + hiddenListName);
      })
      .catch((err) => {
        console.log(err);
      });
   }
});



  

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

// app.get("/work", function(req,res){
//     res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});
//ends here


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
