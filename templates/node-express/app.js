import express from 'express';
export const app = express();
app.disable('x-powered-by');
app.use(express.json({limit:'16kb'}));
app.get('/healthz', (_req,res)=>res.json({status:'ok'}));
app.get('/', (_req,res)=>res.json({message:'Hello from Deplexo',health:'/healthz',greeting:'POST /greet'}));
app.post('/greet',(req,res)=>{
 const name=typeof req.body?.name==='string'?req.body.name.trim():'';
 if (!name || name.length>80) return res.status(400).json({error:'name must contain 1 to 80 characters'});
 res.json({message:`Hello, ${name}!`});
});
app.use((err,_req,res,_next)=>{const status=err.status===413?413:err instanceof SyntaxError?400:500;res.status(status).json({error:status===413?'request body too large':status===400?'invalid JSON':'internal server error'});});
app.use((_req,res)=>res.status(404).json({error:'not found'}));
