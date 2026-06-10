const https=require('https');const http=require('http');const PORT=process.env.PORT||3000;const WICS_HOST='servicelayer.wics.nl';const ALLOWED_KEYS=new Set(['NFKagRJKVYaJhaaEhLrG','nJrhPBVRnbKvcKRDTxpw','mzbROhOTyJaRNknbshBb','VySKpJXFJZyrLTivSwol','YdVgIVVvuXqcIzBsmxWD','FPcIishwiJuQjMdEmBon','FBewJuvRNbXzSdEQSUUw','wPfPzCOFVaGYwtzsNSey','iCcUmIeigrKGuaXiJFpr','mDaoSTgZAOfjrsZajoqi','jvWfRrMjLnsREDSzisSp','JDgQsKLACVvGvQhGeeZa','KScFIJSRnlWCLgTfrGcf','VkthfxeivuAzlawmqJnd','nNaZCkezkjQLCMTNxzPk','JeALRxQdvCECkeurIhMj','bZhBKRIlhPNQmlCIPsTE','vVFIeqHCfVQpLbfkJToG','VYTFbhwXkqNhaXGCVGzU','fofyzcGmBLpEYlAauJEh','fXnCIdCuGBRGtclsUOlB','sJHcZtdddEavsEtXpOoF','PabQLIPjJOxawULUYhUr','EbkXjLskXhmLboxomhSL','xvYiCPRorprKSeYcmXah','RohCGhOgnvxbnLiDXsWF','ZNmZbYWUpFOIGizydZpe','ooYGPAkzPTcrjbXqlmRr','MrhmAUVkLQhbGvwnICyk','QKhpsZMGCpuroEayYZIH','VYEvFlklZSyVGhJwLmVG','UyqcoLSnWDkwVunkSceS','JlkMybstHHLqtwWMBWAW','oEJsvJfsGHGDilMUxJLg','dVUKWNIghJbrgFHiFOIZ','KsLbdGQbiILptCJWrplW']);
const server=http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Authorization,Accept,Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  if(req.url==='/'||req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({status:'ok',service:'WICS Proxy',time:new Date().toISOString()}));return;}
  if(!req.url.startsWith('/api/')){res.writeHead(404,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Not found'}));return;}
  const authHeader=req.headers['authorization']||'';
  if(!authHeader.startsWith('Basic ')){res.writeHead(401,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Authorization required'}));return;}
  try{const decoded=Buffer.from(authHeader.slice(6),'base64').toString();const apiKey=decoded.split(':')[0];if(!ALLOWED_KEYS.has(apiKey)){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'API key not allowed'}));return;}}catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Invalid authorization'}));return;}
  const options={hostname:WICS_HOST,port:443,path:req.url,method:'GET',headers:{Authorization:authHeader,Accept:'application/json',Host:WICS_HOST}};
  const proxyReq=https.request(options,(proxyRes)=>{res.writeHead(proxyRes.statusCode,{'Content-Type':proxyRes.headers['content-type']||'application/json'});proxyRes.pipe(res);});
  proxyReq.on('error',(e)=>{res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Proxy error',message:e.message}));});
  proxyReq.end();
});
server.listen(PORT,()=>console.log('WICS Proxy running on port '+PORT));