const express = require("express")
const fs = require("fs");
const cors = require("cors")

const app = express();

let tmp ='';

const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

function save(){
    fs.writeFileSync("data.json", JSON.stringify(data), "utf-8");
}

app.use(express.json())
app.use(cors())

app.get("/", (req,res)=>{
    res.json(data.filter(e=> e.deleted_at == null))
});

app.get("/tmp", (req,res)=>{
    res.json({
        rs:tmp
    })
});


app.get("/:id", (req,res)=>{
    const id = parseInt(req.params.id);
    if(isNaN(id) || data.length <= id || id < 0){
        res.status(400).json({
            msg:"잘못된 id입니다."
        })
        return;
    }
    if(data[id].deleted_at !== null){
        res.status(400).json({
            msg:"이미 제거된 파일입니다."
        })
        return;
    }
    res.json(data[id]);
});

app.delete("/:id", (req,res)=>{
    const id = parseInt(req.params.id);
    if(isNaN(id) || data.length <= id || id < 0){
        res.status(400).json({
            msg:"잘못된 id입니다."
        })
        return;
    }
    if(data[id].deleted_at !== null){
        res.status(400).json({
            msg:"이미 제거된 파일입니다."
        })
        return;
    }
    data[id].deleted_at = Date.now();
    res.json(data[id]);
    save();
});

app.delete("/", (req,res)=>{
    const list = []
    for(const memo of data){
        if(memo.deleted_at === null){
            memo.deleted_at = Date.now();
            list.push(memo)
        }
    }
    res.json(list);
    save();
});

app.post("/tmp", (req,res)=>{
    const {content} = req.body;

    if(!content || content.length === 0){
        res.status(400).json({
            msg : "콘텐츠가 올바르지 않습니다."
        });
        return;
    }

    tmp = content;

    res.json({
        rs:true
    })
});

app.post('/', (req, res)=>{

    const {content} = req.body;

    if(!content || content.length === 0){
        res.status(400).json({
            msg : "콘텐츠가 올바르지 않습니다."
        });
        return;
    }

    const memo = {
        content,
        created_at:Date.now(),
        updated_at:null,
        deleted_at:null
    }

    tmp = "";
    
    data.push(memo);

    res.json(memo)
    save()
})
app.put('/:id', (req, res)=>{

    const id = parseInt(req.params.id);
    if(isNaN(id) || data.length <= id || id < 0){
        res.status(400).json({
            msg:"잘못된 id입니다."
        })
        return;
    }
    if(data[id].deleted_at !== null){
        res.status(400).json({
            msg:"이미 제거된 파일입니다."
        })
        return;
    }

    const {content} = req.body;

    if(!content || content.length === 0){
        res.status(400).json({
            msg : "콘텐츠가 올바르지 않습니다."
        });
        return;
    }
    

    data[id].content = content
    data[id].updated_at = Date.now();

    res.json(data[id])
    save()
})

app.listen(8080, ()=>{
    console.log('클라우드 메모장 실행')
});