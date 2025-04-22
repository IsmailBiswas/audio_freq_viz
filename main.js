const lowRangeSlider = document.getElementById('lowRange')
let lowRange = parseInt(lowRangeSlider.value)

lowRangeSlider.oninput = function () {
  lowRange = parseInt(this.value)
}

const canvas = document.getElementById('vizCanvas')
const ctx = canvas.getContext('2d')

ctx.lineWidth = 2.8
ctx.strokeStyle = 'white'
function draw(bins) {
  var start = 0
  var end = (2 * Math.PI) / bins.length
  var inc = (2 * Math.PI) / bins.length

  bins.forEach((sample, index, array) => {
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, sample, start, end)
    ctx.stroke()
    start = start + inc
    end = end + inc
  })
}

function normalizeDataArray(dataArray) {
  const minValue = 0
  const maxValue = 255
  const newMaxValue = 250
  const normalizedArray = new Array(dataArray.length)

  for (let i = 0; i < dataArray.length; i++) {
    const originalValue = dataArray[i]

    const normalizedValue =
      ((originalValue - minValue) / (maxValue - minValue)) * (newMaxValue - lowRange) + lowRange

    normalizedArray[i] = normalizedValue
  }

  return normalizedArray
}

navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(function (stream) {
    const audioContext = new window.AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()

    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.8
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    source.connect(analyser)

    function visualize() {
      requestAnimationFrame(visualize)

      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      draw(normalizeDataArray(dataArray))
    }

    visualize()
  })
  .catch(function (err) {
    console.error('Error accessing microphone:', err)
  })
