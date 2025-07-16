const Blog = require('../models/blogModel');
const User = require('../models/userModel');


//create new Blog Controller function
const createNewBlog = async(req, res) => {
  const {title, content} = req.body;
  const {userId} = req.user;
  //check if user exists

  try{

  const newBlog = new Blog ({title, content, user: userId});
  await newBlog.save();

  if(!newBlog){
    return res.status(400).json({error: "Blog not created"});
  }

  return res.status(201).json({message: "Blog created successfully", newBlog});
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

//get all blogs controller function
const getAllBlogs = async(req, res) => {
  try{

    //get page and limit from querry string, fallback to default values
    const page = parseInt(req.query.page) || 1; //default page is 1
    const limit = parseInt(req.query.limit) || 11; //default limit is 11
    const skip = (page - 1) * limit; //calculate skip value

    //fetch blogs from database with pagination
    const blogs = await Blog.find().populate("user", "firstName lastName email").sort({createdAt: -1}).skip(skip).limit(limit);

    //get total number of blogs fpr metadata
    const totalBlogs = await Blog.countDocuments();

    return res.status(200).json({message: "Blogs fetched successfully", page, limit, totalPages: Math.ceil(totalBlogs/limit), totalBlogs, blogs});
  
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

//get single blog controller function
const getSingleBlog = async(req, res) => {
  const {blogId} = req.params;
  //check if blog exists

  try{
    const blog = await Blog.findById(blogId).populate("user", "firstName lastName email").sort({createdAt: -1});

    if(!blog){
      return res.status(404).json({error: "Blog not found"});
    }

    return res.status(200).json({message: "Blog fetched successfully", blog});

  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};


//update blog controller function
const updateBlog = async(req, res) => {
  const {blogId} = req.params;
  const {title, content} = req.body;
  const {userId} = req.user;

  try{

    //check if blog exists
    const blog = await Blog.findById(blogId);
    if(!blog){
      return res.status(404).json({error: "Blog not Found"});
    }

    //check if user is author of the blog
    if(blog.user.toString() !== userId){
      return res.status(403).json({error: "You are not authorized to update this blog"});
    }

    //update blog
    blog.title = title || blog.title;
    blog.content = content || blog.content;

    //save the updated blog
    const updatedBlog = await blog.save();

    return res.status(200).json({message: "Blog updated successfully", updatedBlog});

        
  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};


//delete blog controller function
const deleteBlog = async(req, res) => {
  const {blogId} = req.params;
  const {userId} = req.user;

  try{
    //check if blog exists
    const blog = await Blog.findById(blogId);
    if(!blog){
      return res.status(404).json({error: "Blog not Found"});
    }

    //check if user is the author of the blog
    if(blog.user.toString() !== userId){
      return res.status(403).json({error: "You are not authorized to delete this blog"});
    }

    //delete blog
    const deletedBlog = await Blog.findByIdAndDelete(blogId);

    if(!deletedBlog){
      return res.status(404).json({error: "Blog not found"});
    }

    return res.status(200).json({message: "Blog deleted successfully", deletedBlog});

  }catch(error){
    res.status(500).json({error: "Server Error"});
  }
};

module.exports = {createNewBlog, getAllBlogs, getSingleBlog, updateBlog, deleteBlog};