/* eslint-disable no-undef */
<template>
  <div id="wrapper">
    <el-row>
      <el-col :span="12">
        <el-button @click="createExcel" style="margin:15px;" type="primary" plain>创建excel</el-button>
        <el-button @click="createFile" style="margin:15px;" type="primary" plain>生成</el-button>
        <el-button @click="downloadFile" style="margin:15px;" type="primary" plain>下载</el-button>
      </el-col>
      <el-col :span="12"></el-col>
    </el-row>

    <el-row>
      <el-col :span="12">
        <el-upload class="upload-demo" drag action="#" :show-file-list="false" :on-change="lefthandleChange" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" :auto-upload="false">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传*文件，且不超过500kb</div>
        </el-upload>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-table :data="tableData1" border style="width: 100%">
          <el-table-column type="index" label="序号">
          </el-table-column>
          <el-table-column label="姓名">
            <template scope="scope">
              {{scope.row[0]}}
            </template>
          </el-table-column>
          <el-table-column label="工号">
            <template scope="scope">
              {{scope.row[1]}}
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
let xlsx = require('node-xlsx')
const ipcRenderer = require('electron').ipcRenderer
let fs = require('fs')
let path = require('path')
let request = require('request')
var Bagpipe = require('bagpipe')
var bagpipe = new Bagpipe(10)
var index = 1

let downloadImage = function (src, dest, callback) {
  // eslint-disable-next-line handle-callback-err
  request.head(src, function (err, res, body) {
    if (src) {
      request(src)
        .pipe(fs.createWriteStream(dest))
        .on('close', function () {
          callback(null, dest)
        })
    }
  })
}
const { remote } = require('electron')
let Dir = remote.app.getPath('desktop')
// var path = require('path')
export default {
  name: 'landing-page',
  data () {
    return {
      tableData1: [],
      restaurants: [],
      effectiveUsers: [],
      imageLinks: []
    }
  },
  created () {
    this.getList()
  },
  methods: {
    createExcel () {
      let excelList = []
      let restaurants = this.restaurants
      let len = restaurants.length
      // len = 300
      excelList.push(['姓名', '工号'])
      for (let i = 0; i < len; i++) {
        const element = restaurants[i]
        if (element.name && element.jobNumber) {
          excelList.push([element.name, element.jobNumber])
        }
      }
      this.effectiveUsers = excelList

      var buffer = xlsx.build([{ name: 'mySheetName', data: excelList }])
      fs.writeFileSync(`${Dir}/user1.xlsx`, buffer, 'binary')
      this.$message(`一共${excelList.length}条`)
    },
    getList () {
      this.$http
        .get('http://upms.dev.victorplus.cn/upms/crm/getusers?roleName=public')
        .then(res => {
          let list = res.data.data
          this.restaurants = list
          let user = []
          for (let i = 0; i < 300; i++) {
            const element = list[i]
            // console.log(element)
            user.push({
              name: `${element.name}(${element.jobNumber})`,
              image: element.avatar,
              thumb_image: element.avatar
            })
          }
          // console.log(JSON.stringify(user))
        })
    },
    downloadFile1 () {
      ipcRenderer.send(
        'download',
        'https://zhaopian.victorplus.cn/image/D00479.jpg'
      )
      ipcRenderer.once('tips', (event, message) => {
        console.log('message from Main Process: ', message) // Prints Main Process Message.
      })
    },
    downloadFile () {
      // console.log(this.effectiveUsers)
      console.log(this.tableData1, 'downloadFile')
      this.download(this.tableData1)
      // this.downloadFile(this.effectiveUsers)
    },
    download (userList) {
      let imageLinks = []
      // console.log(userList.length)
      for (let i = 0; i < userList.length; i++) {
        const element = userList[i]
        imageLinks.push(
          `https://zhaopian.victorplus.cn/image/${element[1]}.jpg`
        )
      }
      for (var i = 0; i < imageLinks.length; i++) {
        if (imageLinks[i].indexOf('https://zhaopian.victorplus.cn') === 0) {
          var destImage = path.resolve(
            `${Dir}/user/images`,
            imageLinks[i].split('/')[imageLinks[i].split('/').length - 1]
          )

          bagpipe.push(
            downloadImage,
            imageLinks[i],
            destImage,
            // eslint-disable-next-line handle-callback-err
            function (err, data) {
              console.log('[' + index++ + ']: ' + data)
            }
          )
        }
      }
    },
    createFile () {
      let users = []
      let tableData1 = this.tableData1
      for (let i = 0; i < tableData1.length; i++) {
        const element = tableData1[i]
        users.push({
          image: `./user/${element[1]}.jpg`,
          thumb_image: `./header/${element[1]}.jpg`,
          name: `${element[0]}(${element[1]})`
        })
      }
      fs.writeFileSync(`${Dir}/user/user.json`, JSON.stringify(users), 'utf-8')
      // this.download(tableData1)
    },
    createFile1 () {
      let users = []
      let tableData1 = this.tableData1
      for (let i = 0; i < tableData1.length; i++) {
        const element = tableData1[i]
        users.push({
          image: `./user/${element[1]}.jpg`,
          thumb_image: `./user/${element[1]}.jpg`,
          name: `${element[0]}(${element[1]})`
        })
      }
      fs.writeFileSync(`${Dir}/user/user.json`, JSON.stringify(users), 'utf-8')
      // this.download(tableData1)
    },
    getUser () {},
    lefthandleChange: function (file, fileList) {
      this.fileReader(file, fileList)
    },
    fileReader: function (file, fileList, where) {
      console.log(file)
      this.size = 0
      let fileType = file.name
        .substring(file.name.lastIndexOf('.') + 1)
        .toUpperCase()
      if (fileType === 'XLSX' || fileType === 'XLS') {
        this.size = 0
        let obj = xlsx.parse(file.raw.path)

        this.tableData1 = obj[0].data
        this.tableData1.shift()
      } else {
        // this.$notify({
        //   title: '警告',
        //   message: file.name + '文件格式错误，只允许上传excel文件！',
        //   type: 'warning',
        //   duration: 0
        // })
      }
    }
  }
}
</script>

<style>
</style>
