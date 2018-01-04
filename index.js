'use strict';
const uuidv4 = require('uuid/v4');

const USER_DEVICES = [
    {
        'endpointId': 'endpoint-001',
        'manufacturerName': 'leachiM2k Raspberry',
        'friendlyName': 'Sessel',
        'description': '001',
        'displayCategories': ['LIGHT'],
        'capabilities': [
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa',
                'version': '3'
            },
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa.PowerController',
                'version': '3',
                'properties': {
                    'supported': [
                        {
                            'name': 'powerState'
                        }
                    ],
                }
            }
        ]
    },
    {
        'endpointId': 'endpoint-002',
        'manufacturerName': 'leachiM2k Raspberry',
        'friendlyName': 'Esszimmer',
        'description': '002',
        'displayCategories': ['LIGHT'],
        'capabilities': [
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa',
                'version': '3'
            },
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa.PowerController',
                'version': '3',
                'properties': {
                    'supported': [
                        {
                            'name': 'powerState'
                        }
                    ],
                }
            }
        ]
    },
    {
        'endpointId': 'endpoint-003',
        'manufacturerName': 'leachiM2k Raspberry',
        'friendlyName': 'Wohnzimmer',
        'description': '003',
        'displayCategories': ['LIGHT'],
        'capabilities': [
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa',
                'version': '3'
            },
            {
                'type': 'AlexaInterface',
                'interface': 'Alexa.PowerController',
                'version': '3',
                'properties': {
                    'supported': [
                        {
                            'name': 'powerState'
                        }
                    ],
                }
            }
        ]
    },

];

/**
 * Utility functions
 */

function log(title, msg) {
    console.log(`[${title}] ${msg}`);
}

/**
 * Generate a unique message ID
 *
 * TODO: UUID v4 is recommended as a message ID in production.
 */
function generateMessageID() {
    return uuidv4();
}

/**
 * Generate a response message
 *
 * @param {string} type - Error type
 * @returns {Object} Response object
 */
function generateErrorResponse(type) {
    return {
        event: {
            header: {
                namespace: 'Alexa',
                name: 'ErrorResponse',
                payloadVersion: '3',
                messageId: generateMessageID()
            },
            payload: {
              type: type
            }
        },
    };
}

/**
 * Mock functions to access device cloud.
 *
 * TODO: Pass a user access token and call cloud APIs in production.
 */

function getDevicesFromPartnerCloud() {
    return USER_DEVICES;
}

function isValidToken() {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    return true;
}

function isDeviceOnline(endpointId) {
    log('DEBUG', `isDeviceOnline (endpointId: ${endpointId})`);

    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
}

function turnOn(endpointId, userAccessToken) {
    log('DEBUG', `turnOn (endpointId: ${endpointId})`);

    // Call device cloud's API to turn on the device

    return  {
      context: {
        properties: [
          {
            namespace: 'Alexa.PowerController',
            name: 'powerState',
            value: 'ON',
            timeOfSample: (new Date()).toISOString(),
            uncertaintyInMilliseconds: 50,
          }
        ]
      },
      event: {
        header: {
          namespace: 'Alexa',
          name: 'Response',
          payloadVersion: '3',
          messageId: generateMessageID(),
        },
        endpoint: {
          scope: {
            type: 'BearerToken',
            token: userAccessToken,
          },
          endpointId: endpointId
        },
        payload: {}
      }
    };
}

function turnOff(endpointId, userAccessToken) {
  log('DEBUG', `turnOff (endpointId: ${endpointId})`);

  // Call device cloud's API to turn on the device

  return  {
    context: {
      properties: [
        {
          namespace: 'Alexa.PowerController',
          name: 'powerState',
          value: 'OFF',
          timeOfSample: (new Date()).toISOString(),
          uncertaintyInMilliseconds: 50,
        }
      ]
    },
    event: {
      header: {
        namespace: 'Alexa',
        name: 'Response',
        payloadVersion: '3',
        messageId: generateMessageID(),
      },
      endpoint: {
        scope: {
          type: 'BearerToken',
          token: userAccessToken,
        },
        endpointId: endpointId
      },
      payload: {}
    }
  };
}

/**
 * Main logic
 */

/**
 * This function is invoked when we receive a 'Discovery' message from Alexa Smart Home Skill.
 * We are expected to respond back with a list of appliances that we have discovered for a given customer.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleDiscovery(request, callback) {
    log('DEBUG', `Discovery Request: ${JSON.stringify(request)}`);

    /**
     * Get the OAuth token from the request.
     */
    const userAccessToken = request.directive.payload.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        const errorMessage = `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`;
        log('ERROR', errorMessage);
        callback(new Error(errorMessage));
    }

    /**
     * Assume access token is valid at this point.
     * Retrieve list of devices from cloud based on token.
     *
     * For more information on a discovery response see
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#discoverappliancesresponse
     */
    const response = {
      event: {
        header: {
            namespace: 'Alexa.Discovery',
            name: 'Discover.Response',
            payloadVersion: '3',
            messageId: generateMessageID(),
        },
        payload: {
            endpoints: getDevicesFromPartnerCloud(userAccessToken),
        },
      }
    };

    /**
     * Log the response. These messages will be stored in CloudWatch.
     */
    log('DEBUG', `Discovery Response: ${JSON.stringify(response)}`);

    /**
     * Return result with successful message.
     */
    callback(null, response);
}

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
function handleControl(request, callback) {
    log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

    /**
     * Get the access token.
     */
    const userAccessToken = request.directive.payload.scope.token.trim();

    /**
     * Generic stub for validating the token against your cloud service.
     * Replace isValidToken() function with your own validation.
     *
     * If the token is invliad, return InvalidAccessTokenError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#invalidaccesstokenerror
     */
    if (!userAccessToken || !isValidToken(userAccessToken)) {
        log('ERROR', `Discovery Request [${request.directive.header.messageId}] failed. Invalid access token: ${userAccessToken}`);
        callback(null, generateErrorResponse('INVALID_AUTHORIZATION_CREDENTIAL'));
        return;
    }

    /**
     * Grab the endpointId from the request.
     */
    const endpointId = request.directive.endpoint.endpointId;

    /**
     * If the endpointId is missing, return UnexpectedInformationReceivedError
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#unexpectedinformationreceivederror
     */
    if (!endpointId) {
        log('ERROR', 'No endpointId provided in request');
        callback(null, generateErrorResponse('INVALID_VALUE'));
        return;
    }

    /**
     * At this point the endpointId and accessToken are present in the request.
     *
     * Please review the full list of errors in the link below for different states that can be reported.
     * If these apply to your device/cloud infrastructure, please add the checks and respond with
     * accurate error messages. This will give the user the best experience and help diagnose issues with
     * their devices, accounts, and environment
     *  https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/smart-home-skill-api-reference#error-messages
     */
    if (!isDeviceOnline(endpointId, userAccessToken)) {
        log('ERROR', `Device offline: ${endpointId}`);
        callback(null, generateErrorResponse('ENDPOINT_UNREACHABLE'));
        return;
    }

    let response;

    switch (request.directive.header.name) {
        case 'TurnOn':
            response = turnOn(endpointId, userAccessToken);
            break;

        case 'TurnOff':
            response = turnOff(endpointId, userAccessToken);
            break;

        default: {
            log('ERROR', `No supported directive name: ${request.directive.header.name}`);
            callback(null, generateErrorResponse('INVALID_DIRECTIVE'));
            return;
        }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    callback(null, response);
}

function handleRequest(request, callback) {
  switch (request.directive.header.namespace) {
      case 'Alexa.Discovery':
          handleDiscovery(request, callback);
          break;

      case 'Alexa.PowerController':
          handleControl(request, callback);
          break;

      /**
       * Received an unexpected message
       */
      default: {
          const errorMessage = `No supported namespace: ${request.directive.header.namespace}`;
          log('ERROR', errorMessage);
          callback(new Error(errorMessage));
      }
  }
}

exports.handler = (request, context, callback) => {
  try {
    handleRequest(request, callback);
  } catch(e) {
    callback(e);
  }
};
