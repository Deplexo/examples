import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from './app.js';
test('health, validation and malformed JSON',async t=>{
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const base=`http://127.0.0.1:${server.address().port}`;
 assert.deepEqual(await (await fetch(base+'/healthz')).json(),{status:'ok'});
 const valid=await fetch(base+'/greet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Alex'})});
 assert.equal(valid.status,200);assert.deepEqual(await valid.json(),{message:'Hello, Alex!'});
 const invalid=await fetch(base+'/greet',{method:'POST',headers:{'content-type':'application/json'},body:'{'});assert.equal(invalid.status,400);
 const empty=await fetch(base+'/greet',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});assert.equal(empty.status,400);
});
