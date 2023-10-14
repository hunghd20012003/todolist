//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const _=require('lodash');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect('mongodb+srv://hoangdinhhung20012003:hust20210399@cluster0.ct3oyc8.mongodb.net/todolisstDB');

const Item = mongoose.model('Item', { 
  name: String 
});
const item1=new Item({
  name:"Welcom to your todolist!"
});
const item2=new Item({
  name:"hit the + button to add a new item."
});
const item3=new Item({
  name:"<--Hit this to delete an item"
});
const defaultItem=[item1,item2,item3];

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
const listSchema=mongoose.model("List",{
  name: String,
  items:[{name:String}]
});

app.get("/", function(req, res) {

const day = date.getDate();
   Item.find({}).then((items)=>{
    if(items.length===0){
      Item.insertMany(defaultItem).then(()=>{console.log("suceess")}).catch(()=>{console.log("lỗi find item")});
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items});

    }
  }).catch(()=>console.log("lỗi 2"));

});
app.get("/:customListName",(req,res)=>{
  const custionListName=_.capitalize(req.params.customListName);

  listSchema.findOne({name:custionListName}).then((list)=>{
    if(!list){
      const list=new listSchema({
        name:custionListName,
        items:defaultItem
      });
      list.save().then(()=>{console.log("thành công")}).catch(()=>console.log("Thất bại"));
      res.redirect("/"+custionListName);
    }else {
      res.render("list",{listTitle: list.name, newListItems:list.items});
    }
  }).catch(()=>{console.log("lỗi 3")});
  

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name: itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    listSchema.findOne({name:listName}).then(function(list){
      list.items.push(item);
      list.save();
      res.redirect("/"+listName);
    }).then(()=>{console.log("lỗi 4")});
  }

});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(()=>console.log("success")).catch(()=>console.log("thất bại"));
    res.redirect("/");
  }
  else{
    listSchema.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },{new:true}
    ).then(function(){
      res.redirect("/"+listName);
    }).catch(()=>console.log("up bị lỗi"));
    
  }
  
});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
