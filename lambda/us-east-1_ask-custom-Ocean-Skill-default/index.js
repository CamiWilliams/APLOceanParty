/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const numbers = require('./numbers');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to my Ocean Party! Say begin to see my favorite ocean animals!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Ocean Party', speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: require('./launchrequest.json'),
        datasources: require('./sampleDataSource.json')
      })
      .getResponse();
  },
};

const BeginIntentHandler = {
  canHandle(handlerInput) { 
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'BeginIntent'
        || request.type === 'Alexa.Presentation.APL.UserEvent' 
            && request.arguments.length > 0 
            && request.arguments[0] == "begin";
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
          .speak("Here is a list of Cami's favorite ocean animals! You can select one to hear more information.")
          .reprompt("Select an animal!")
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./listAnimals.json'),
            datasources: require('./sampleDataSource.json')
          })
          .getResponse();
  }
}

const ListItemPressedHandler = {
  canHandle(handlerInput) { 
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'Alexa.Presentation.APL.UserEvent' && request.arguments.length > 0;
  },
  handle(handlerInput) {
    const selectedItem = Number(handlerInput.requestEnvelope.request.arguments[0]);
    return handlerInput.responseBuilder
          .speak(ANIMAL_DATA[selectedItem].description)
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            token: 'itemPressed',
            document: require('./selectedAnimal.json'),
            datasources: createAnimalDatasource.call(this, ANIMAL_DATA[selectedItem].title, ANIMAL_DATA[selectedItem].description, ANIMAL_DATA[selectedItem].imgSrc)
          })
          .getResponse();
  }
}

const GetAnimalByNumberHandler = {
    canHandle: (handlerInput) => {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SelectByNumberIntent';
    },
    handle: (handlerInput) => {
        const slotValue = handlerInput.requestEnvelope.request.intent.slots.ordinal.value || handlerInput.requestEnvelope.request.intent.slots.cardinal.value;

        console.log(`Got Slot number: ${slotValue}`);
        const selectedItem = numbers.ordinalToNumber(slotValue) - 1;
        console.log(`Number resolved to: ${selectedItem}`);
    
        if(isNaN(selectedItem)) {
            return handlerInput.responseBuilder
                            .speak('Sorry, I didn\'t recognize that animal, please try again!')
                            .reprompt('Which animal would you like to learn about?')        
                            .getResponse();
        }
    
        const numItems = ANIMAL_DATA.length;
        if(selectedItem > numItems) {
            return handlerInput.responseBuilder
                               .speak('Sorry, I couldn\'t find that animal, please say a number between 1 and ' + numItems)
                               .reprompt('Which animal would you like to learn about?')        
                               .getResponse();
        }
    
        return handlerInput.responseBuilder
          .speak(ANIMAL_DATA[selectedItem].description)
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./selectedAnimal.json'),
            datasources: createAnimalDatasource.call(this, ANIMAL_DATA[selectedItem].title, ANIMAL_DATA[selectedItem].description, ANIMAL_DATA[selectedItem].imgSrc)
          })
          .getResponse();
    }
}

const GetAnimalByTitleHandler = {
    canHandle: (handlerInput) => {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'OceanAnimalIntent';
    },
    handle: (handlerInput) => {
        const titleValue = handlerInput.requestEnvelope.request.intent.slots.animal.value;
        console.log('animalvalue ' + titleValue);
        
        var selectedItem = 0;
        while(selectedItem < ANIMAL_DATA.length) {
          if (titleValue == ANIMAL_DATA[selectedItem].name) {
            break;
          }
        }
        if (selectedItem == ANIMAL_DATA.length && titleValue != ANIMAL_DATA[selectedItem].name) {
            return handlerInput.responseBuilder
                            .speak('Sorry, I didn\'t recognize that animal, try again!')
                            .reprompt('Which animal would you like to learn about?')        
                            .getResponse();
        }
        
        return handlerInput.responseBuilder
          .speak(ANIMAL_DATA[selectedItem].description)
          .addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: require('./selectedAnimal.json'),
            datasources: createAnimalDatasource.call(this, ANIMAL_DATA[selectedItem].title, ANIMAL_DATA[selectedItem].description, ANIMAL_DATA[selectedItem].imgSrc)
          })
          .getResponse();
    }
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can select a animal from the list by saying the name of the animal or the number!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('FireTV Vlogs', speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: require('./launchRequest.json'),
        datasources: require('./sampleDataSource.json')
      })
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Goodbye!', speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        document: require('./goodbye.json')
      })
      .addDirective({
              type: "Alexa.Presentation.APL.ExecuteCommands",
              token: "VideoPlayerToken",
              commands: [
                {
                  type: "ControlMedia",
                  componentId: "myVideoPlayer",
                  command: "play"
                }
              ]
            })
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

function createAnimalDatasource(title, description, imgSrc) {
  return {
    "bodyTemplate3Data": {
        "type": "object",
        "objectId": "bt3Sample",
        "backgroundImage": {
            "contentDescription": null,
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                {
                    "url": "https://s3.amazonaws.com/apl-community-code/ocean/dark-water.jpg",
                    "size": "small",
                    "widthPixels": 0,
                    "heightPixels": 0
                },
                {
                    "url": "https://s3.amazonaws.com/apl-community-code/ocean/dark-water.jpg",
                    "size": "large",
                    "widthPixels": 0,
                    "heightPixels": 0
                }
            ]
        },
        "title": title,
        "image": {
            "contentDescription": null,
            "smallSourceUrl": null,
            "largeSourceUrl": null,
            "sources": [
                {
                    "url": imgSrc,
                    "size": "small",
                    "widthPixels": 0,
                    "heightPixels": 0
                },
                {
                    "url": imgSrc,
                    "size": "large",
                    "widthPixels": 0,
                    "heightPixels": 0
                }
            ]
        },
        "textContent": {
            "title": {
                "type": "PlainText",
                "text": title
            },
            "primaryText": {
                "type": "PlainText",
                "text": description
            }
        },
        "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
    }
  }
}

const ANIMAL_DATA = [
  {
    "name": "shark",
    "title": "Shark",
    "imgSrc": "https://s3.amazonaws.com/apl-community-code/ocean/shark.jpg",
    "description": "Sharks are a group of elasmobranch fish characterized by a cartilaginous skeleton, five to seven gill slits on the sides of the head, and pectoral fins that are not fused to the head."
  },
  {
    "name": "jellyfish",
    "title": "Jellyfish",
    "imgSrc": "https://s3.amazonaws.com/apl-community-code/ocean/jellyfish2.jpg",
    "description": "Jellyfish or sea jellies are the informal common names given to the medusa-phase of certain gelatinous members of the subphylum Medusozoa, a major part of the phylum Cnidaria."
  },
  {
    "name": "seahorse",
    "title": "Seahorse",
    "imgSrc": "https://s3.amazonaws.com/apl-community-code/ocean/seahorse.jpg",
    "description": "Seahorse is the name given to 45 species of small marine fishes in the genus Hippocampus. \"Hippocampus\" comes from the Ancient Greek hippokampos, itself from hippos meaning \"horse\" and kampos meaning \"sea monster\"." 
  },
  {
    "name": "killer whale",
    "title": "Killer Whale",
    "imgSrc": "https://s3.amazonaws.com/apl-community-code/ocean/killer-whale.jpg",
    "description": "The killer whale or orca is a toothed whale belonging to the oceanic dolphin family, of which it is the largest member. Killer whales have a diverse diet, although individual populations often specialize in particular types of prey."
  },
  {
    "name": "dolphin",
    "title": "Dolphin",
    "imgSrc": "https://s3.amazonaws.com/apl-community-code/ocean/dolphin.jpg",
    "description": "Dolphin is a common name of aquatic mammals within the order Cetacea, arbitrarily excluding whales and porpoises."
  }
];

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    BeginIntentHandler,
    ListItemPressedHandler,
    GetAnimalByNumberHandler,
    GetAnimalByTitleHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();








