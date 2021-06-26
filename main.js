const video = document.getElementById('video')

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models')
])

async function startCamera(){
  cameraImg = document.getElementById('cameraNotShowing')
  try{
    cameraImg.remove()
  }
  catch(err){
    console.log(err)
  }
  landmarkCheck = document.getElementById('Landmarks')
  age = document.getElementById('Age')
  expressions = document.getElementById('Expression')
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
  const canvas = faceapi.createCanvasFromMedia(video)
  canvas.id = 'cameraCanvas'
  cameraContainer = document.getElementById('cameraContainer')
  cameraContainer.append(canvas)
  video.style.position = 'absolute'
  video.addEventListener('play', () => {
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors()
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      if(landmarkCheck.checked == true){
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      }
      if(age.checked == true){
        resizedDetections.forEach( detection => {
          const box = detection.detection.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
          drawBox.draw(canvas)
        })
      }
      if(expressions.checked == true){
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
      } 
    }, 100)
  })
}

function stopCamera(){
  const mediaStream = video.srcObject;
  const tracks = mediaStream.getTracks();
  tracks.forEach(track => track.stop())
  canvas = document.getElementById('cameraCanvas')
  try{
    canvas.remove()
  }
  catch(err){
    console.log(err)
  }
}
