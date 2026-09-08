import express from "express";
import cors from "cors";
import pg from "pg";
import {hashPassword,verifyPassword,signToken} from "./auth.js";
const {Pool}=pg;
const app=express();
app.use(cors({origin:true,credentials:true}));
app.use(express.json());
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_URL?{rejectUnauthorized:false}:false});

app.get("/health",async(_req,res)=>{try{await pool.query("select 1");res.json({ok:true,service:"hair-salon-api"});}catch(e){res.status(503).json({ok:false});}});
app.get("/api/outlets",async(_req,res)=>{try{const {rows}=await pool.query("select id,name,city,active from hair_salon.outlets where active=true order by name");res.json(rows);}catch(e){res.status(500).json({error:"Unable to load outlets"});}});

app.post("/api/auth/login",async(req,res)=>{
  try{
    const {email,password}=req.body||{};
    if(!email||!password)return res.status(400).json({error:"Email and password are required"});
    const q="select u.id,u.name,u.email,u.password_hash,u.outlet_id,r.name role,o.name outlet_name from hair_salon.users u join hair_salon.roles r on r.id=u.role_id left join hair_salon.outlets o on o.id=u.outlet_id where lower(u.email)=lower($1) and u.active=true limit 1";
    const {rows}=await pool.query(q,[email.trim()]);
    const user=rows[0];
    if(!user)return res.status(401).json({error:"Invalid email or password"});
    const [salt,hash]=user.password_hash.split(":");
    if(!salt||!hash||!verifyPassword(password,hash,salt))return res.status(401).json({error:"Invalid email or password"});
    const token=signToken({sub:user.id,role:user.role,outletId:user.outlet_id});
    res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role,outletId:user.outlet_id,outletName:user.outlet_name}});
  }catch(e){console.error(e);res.status(500).json({error:"Login service unavailable"});}
});

app.listen(process.env.PORT||10000,()=>console.log("Hair Salon API running"));