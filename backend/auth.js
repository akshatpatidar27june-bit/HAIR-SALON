import crypto from "node:crypto";
export function hashPassword(password,salt=crypto.randomBytes(16).toString("hex")){
  const hash=crypto.scryptSync(password,salt,64).toString("hex");
  return {hash,salt};
}
export function verifyPassword(password,hash,salt){
  const candidate=crypto.scryptSync(password,salt,64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate,"hex"),Buffer.from(hash,"hex"));
}
export function signToken(payload){
  const body=Buffer.from(JSON.stringify({...payload,exp:Date.now()+1000*60*60*12})).toString("base64url");
  const secret=process.env.AUTH_SECRET||"change-this-in-render";
  const sig=crypto.createHmac("sha256",secret).update(body).digest("base64url");
  return body+"."+sig;
}
export function readToken(token){
  if(!token) return null;
  const [body,sig]=token.split(".");
  if(!body||!sig)return null;
  const secret=process.env.AUTH_SECRET||"change-this-in-render";
  const expected=crypto.createHmac("sha256",secret).update(body).digest("base64url");
  if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;
  const data=JSON.parse(Buffer.from(body,"base64url").toString());
  return data.exp>Date.now()?data:null;
}
