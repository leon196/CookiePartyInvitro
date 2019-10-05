
var attributesLine = {position:[],indices:{numComponents:2,data:[]},seed:{numComponents:4,data:[]}};

var attributesPoint = {position:[],seed:{numComponents:4,data:[]}};
for (var index = 0; index < pointCount; ++index) {
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	attributesPoint.position.push(0,0,0);
	attributesPoint.seed.data.push(rnd[0],rnd[1],rnd[2],index/(pointCount-1));
}

for (var index = 0; index < cubeCount; ++index) {
	var indices = [0,1,1,3,3,2,2,0,4,5,5,7,7,6,6,4,0,4,1,5,2,6,3,7];
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	var positions = [-1,-1,-1,1,-1,-1,-1,1,-1,1,1,-1,-1,-1,1,1,-1,1,-1,1,1,1,1,1];
	for (var i = 0; i < positions.length; ++i) positions[i] *= .75;
	for (var i = 0; i < indices.length; ++i) indices[i] += index*8;
	var seed = []; for (var i = 0; i < 8; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(cubeCount-1));
	attributesLine.position = attributesLine.position.concat(positions);
	attributesLine.indices.data = attributesLine.indices.data.concat(indices);
	attributesLine.seed.data = attributesLine.seed.data.concat(seed);
}

for (var index = 0; index < crossCount; ++index) {
	var indices = [0,1,2,3,4,5];
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	for (var i = 0; i < indices.length; ++i) indices[i] += cubeCount*8+index*6;
	var seed = []; for (var i = 0; i < 6; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(crossCount-1));
	attributesLine.position = attributesLine.position.concat([0,1,0,0,-1,0,1,0,0,-1,0,0,0,0,1,0,0,-1]);
	attributesLine.indices.data = attributesLine.indices.data.concat(indices);
	attributesLine.seed.data = attributesLine.seed.data.concat(seed);
}

for (var index = 0; index < circleCount; ++index) {
	var indices = []; for (var i = 0; i < circleSegment; ++i) indices.push(i,(i+1)%circleSegment);
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	for (var i = 0; i < indices.length; ++i) indices[i] += cubeCount*8+crossCount*6+index*circleSegment;
	var seed = []; for (var i = 0; i < circleSegment; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(circleCount-1));
	var positions = []; for (var i = 0; i < circleSegment; ++i) { var a=Math.PI*2*i/(circleSegment); positions.push(Math.cos(a), 0, Math.sin(a)); }
	attributesLine.position = attributesLine.position.concat(positions);
	attributesLine.indices.data = attributesLine.indices.data.concat(indices);
	attributesLine.seed.data = attributesLine.seed.data.concat(seed);
}

var glassPositions = [0.022434,1.034322,0.369725,1.274269,0.818479,0.343764,0.217788,0.998567,0.264331,1.277470,0.806091,-0.211158,0.130684,1.017387,0.456790,1.163883,0.839821,0.482480,1.209406,-0.057186,0.067695,1.210905,-0.062987,-0.192141,1.172286,-0.544278,0.053184,1.146209,-0.887103,0.036436,1.175422,-0.525794,-0.177321,1.159415,-0.691772,0.266868,1.142818,-0.908468,0.271610,1.253900,0.552546,0.349583,1.084868,0.849338,0.275155,1.087386,0.843868,0.020675,0.267663,0.990989,0.315775,1.028363,0.860069,0.325271,0.220031,0.993145,0.009848,1.035702,0.851660,-0.035737,0.270846,0.983296,-0.045284,1.155316,-0.778556,-0.071931,1.147349,-0.843719,0.327511,1.163112,-0.654264,0.155922,1.142615,-0.921865,0.161759,1.153814,-0.759320,0.325664,1.162575,-0.688844,-0.125800,1.145010,-0.876879,0.301346,1.161194,-0.673650,0.214210,1.143766,-0.912920,0.099286,1.150019,-0.842341,-0.015515,1.166385,-0.617593,0.092922,1.142389,-0.919175,0.219583,1.156604,-0.725518,0.298034,1.150554,-0.801557,0.329910,-0.045190,1.045960,0.368881,-1.296983,1.259408,0.311697,-0.238641,1.077121,0.258633,-1.289013,1.249399,-0.243225,-0.154950,1.066546,0.453224,-1.188375,1.244658,0.453117,-0.010064,1.036966,0.220281,-0.006119,1.027432,-0.227192,-1.399862,0.388975,0.030677,-1.396130,0.384288,-0.229159,-1.459467,-0.095789,0.013395,-1.501306,-0.436947,-0.005304,-1.453252,-0.076426,-0.216976,-1.481246,-0.243490,0.226211,-1.507954,-0.459196,0.229718,-1.329761,0.994689,0.316002,-1.105722,1.226351,0.247810,-1.103753,1.220976,-0.006677,-0.289413,1.086865,0.308821,-1.050112,1.217785,0.299325,-0.236398,1.071699,0.004150,-1.051086,1.210808,-0.061786,-0.286229,1.079172,-0.052238,-1.486114,-0.328453,-0.113039,-1.500955,-0.394983,0.285981,-1.474739,-0.205692,0.115493,-1.507722,-0.472071,0.119806,-1.490552,-0.310968,0.284615,-1.474169,-0.238933,-0.166390,-1.504582,-0.427879,0.259631,-1.478119,-0.225231,0.173663,-1.505554,-0.462907,0.057391,-1.494917,-0.392177,-0.056993,-1.469155,-0.168928,0.052710,-1.508380,-0.469636,0.177637,-1.485926,-0.277209,0.257181,-1.495815,-0.353027,0.288620];

var glassIndices = [15,16,2,4,6,2,1,5,42,1,4,43,14,7,27,11,11,8,28,13,29,12,30,10,7,9,5,6,8,4,2,14,17,18,18,15,3,17,21,19,16,20,20,21,19,3,31,22,32,24,33,25,34,26,35,26,22,27,23,28,24,29,25,30,10,31,9,32,13,33,12,34,23,35,52,53,37,39,41,37,36,40,42,36,39,43,51,44,64,48,48,45,65,50,66,49,67,47,44,46,40,41,45,39,37,51,54,55,55,52,38,54,58,56,53,57,57,58,56,38,68,59,69,61,70,62,71,63,72,63,59,64,60,65,61,66,62,67,47,68,46,69,50,70,49,71,60,72];

for (var index = 0; index < glassCount; ++index) {
	var indices = []; indices = indices.concat(glassIndices);
	var rnd = [Math.random()*2-1,Math.random()*2-1,Math.random()*2-1];
	for (var i = 0; i < indices.length; ++i) indices[i] += -1+cubeCount*8+crossCount*6+circleCount*circleSegment+index*72;
	var seed = []; for (var i = 0; i < glassPositions.length; ++i) seed.push(rnd[0],rnd[1],rnd[2],index/(glassCount-1));
	attributesLine.position = attributesLine.position.concat(glassPositions);
	attributesLine.indices.data = attributesLine.indices.data.concat(indices);
	attributesLine.seed.data = attributesLine.seed.data.concat(seed);
}

