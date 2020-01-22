(function () {

    //All meme infos
    let meme = {
      'projectName': 'meme',
      'canvas': document.querySelector("#memeResult"),
      itcontent : function(){
        return this.canvas.getContext("2d");
      },
      'height': document.querySelector("#memeResult").parentNode.clientWidth,
      'width': document.querySelector("#memeResult").parentNode.clientWidth,
      'topText': document.querySelector("#upperText"),
      'bottomText': document.querySelector('#bottomText'),
      'image': null,
      'downloader': document.querySelector('#downloadMeme'),
      'font': 'Arial',
      'fontSize': '30',
      'defaultColor': '#FFFFFF',
      'defaultStrokeColor': '#000000'
    };

    //Initialize cropper & provide target canvas
    cropper.start(meme.canvas, 1);

    //Set multiple attributtes
    function setMultipleAttributes(elm, val) {
        for(var atr in val) {
          elm.setAttribute(atr, val[atr]);
        }
    }
    
    //Set width & height attributes for #memeResult HTML element
    setMultipleAttributes(meme.canvas, {"width" : meme.width, "height" : meme.height});

    //Set default values on inputs
    document.querySelector('#fontSize').value = meme.fontSize;
    document.querySelector('#textColor').value = meme.defaultColor;
    document.querySelector('#strokeColor').value = meme.defaultStrokeColor;
  
    //Read uploaded image
    function readImage(){

        meme.canvas.classList.remove('no-events');

        if ( this.files && this.files[0] ) {
            var imageReader = new FileReader();

            imageReader.onload = function(e) {

                meme.image = new Image();
                meme.image.src = imageReader.result;

                meme.image.onload = function(){

                    meme.itcontent().drawImage(meme.image, 0, 0, meme.width, meme.height);
                    cropper.showImage(meme.image.src);

                }

            };

            imageReader.readAsDataURL(this.files[0]);

        }

        //Create a mask for the default file selector input
        filename = this.files[0].name;
        document.querySelector('#selectedImgName').innerHTML = filename;

        //Validate before press Next
        if(this.value.length > 0){
            this.parentNode.parentNode.classList.add('valid');
        }

    }

    function setCropper(){
        meme.image.src = cropper.getCroppedImageSrc();
    }

    document.querySelector('#startCrop').addEventListener('click', () => cropper.startCropping());
    document.querySelector('#finishCrop').addEventListener('click', setCropper);
    document.querySelector('#startStrech').addEventListener('click', createText);


    //Add trigger on upload image button
    document.querySelector("#selectImg").addEventListener("change", readImage);

    //Add trigger for the text inputs
    document.querySelectorAll('.text-input').forEach(e => {

        e.addEventListener( 'keyup', function(){
          createText();
        });
      
    });

    //Create text
    function createText(){

        meme.canvas.classList.add('no-events');
        meme.itcontent().clearRect(0, 0, meme.width, meme.height);
        meme.itcontent().drawImage(meme.image, 0, 0, meme.width, meme.height);
       
        meme.itcontent().font = `bold ${meme.fontSize}px ${meme.font}`;
        meme.itcontent().strokeStyle = meme.defaultStrokeColor;
        meme.itcontent().fillStyle = meme.defaultColor;
        meme.itcontent().textAlign = "center";
        meme.itcontent().lineWidth = 1;

        meme.itcontent().textBaseline = 'top';
        addText(meme.topText.value, meme.width / 2, meme.fontSize / 2, meme.width, meme.fontSize * 1.2, 'push');

        meme.itcontent().textBaseline = 'bottom';
        addText(meme.bottomText.value, meme.width / 2, meme.height - meme.fontSize / 2, meme.width, -(meme.fontSize * 1.2), 'unshift');

    }

    //Write the texts
    function addText(text, xpos, ypos, allowedWidth, lineHeight, usedMethod){

        var lines = [];
        var line = '';
        var words = text.split(' ');

        for (var i = 0; i < words.length; i++) {

            var measuredLine = line + ' ' + words[i];
            var measuredWidth = meme.itcontent().measureText(measuredLine).width;
      
            if (measuredWidth > allowedWidth) {

              lines[usedMethod](line);
              line = words[i] + ' ';

            } else {

              line = measuredLine;

            }
        }
          
        lines[usedMethod](line);

        for (var j = 0; j < lines.length; j++){
            
            meme.itcontent().fillText(lines[j], xpos, ypos + (j * lineHeight), allowedWidth);
            meme.itcontent().strokeText(lines[j], xpos, ypos + (j * lineHeight), allowedWidth);

        }

        //meme.itcontent().fillText(text, xpos, ypos, allowedWidth);
        //meme.itcontent().strokeText(text, xpos, ypos, allowedWidth);

    }

    //Change default font
    document.querySelector('#fontSelector').addEventListener('change', function(){
        meme.font = this.value;
        createText();
    });

    //Change font size
    document.querySelector('#fontSize').addEventListener('change', function(){

        if(this.value < this.min){
            this.value = this.min;
        } else if (this.value > this.max){
            this.value = this.max;
        }
        
        meme.fontSize = this.value;
        createText();
    });

    //Change text color
    document.querySelector('#textColor').addEventListener('change', function(){
        meme.defaultColor = this.value;
        createText();
    });

    //Change stroke color
    document.querySelector('#strokeColor').addEventListener('change', function(){
        meme.defaultStrokeColor = this.value;
        createText();
    });

    //Set project name
    document.querySelector('#projectName').addEventListener('change', function(){
        meme.projectName = this.value.split(' ').join('-').toLowerCase();
    });

    //Convert Canvas to image, make it ready for download
    function convertCanvasToImage(f) {
        var canvaToImage = new Image();
        canvaToImage.src = meme.canvas.toDataURL("image/png");

        switch(f) {
            case "GIF":
                meme.downloader.download = `${meme.projectName}.gif`
              break;
            case "PNG":
                meme.downloader.download = `${meme.projectName}.png`
              break;
            default:
                meme.downloader.download = `${meme.projectName}.jpg`
        }
    
        meme.downloader.setAttribute('href', canvaToImage.src);
        meme.downloader.classList.add('open-download');

    }

    //Add event on select format element
    document.querySelector('#formatSelect').addEventListener('change', function(){
        convertCanvasToImage(this.value);
    });
  
    //Toggle class after switch off/on
    document.querySelector('.switch input').addEventListener('change', function(){
        document.querySelector('.happy-maker').classList.toggle('happy');
    });

    //Go to next/prev step
    const actionButtons = document.querySelectorAll('.stepper');

    actionButtons.forEach( e => {

        e.addEventListener('click', function(){

            let getActiveStep = e.parentNode.dataset.step;

            if(e.dataset.nav === 'next'){
                getActiveStep++ ; 
            } else {
                getActiveStep-- ;
            }

            e.parentNode.classList.remove('active-step');
            
            document.querySelector(`[data-step='${getActiveStep}']`).classList.add('active-step');


        });

    });



    //end 
  })();