'use strict';
const uuidv4 = require('uuid/v4');
const http = require('http');
const mqtt = require('mqtt');
const USER_DEVICES = require('./data/dummy_endpoints');

if (!process.env.device_host || !process.env.device_port || !process.env.device_token) {
    console.error('Missing important environment variable. Needs: device_host, device_port, device_token');
    process.exit(12);
}
if (!process.env.mqtt_host || !process.env.mqtt_username || !process.env.mqtt_password || !process.env.mqtt_topic) {
    console.error('Missing important environment variable. Needs: mqtt_host, mqtt_username, mqtt_password, mqtt_topic');
    process.exit(12);
}

/**
 * Utility functions
 */
const log = (title, msg) => console.log(`[${title}] ${msg}`);

/**
 * Generate a unique message ID
 */
const generateMessageID = () => uuidv4();

/**
 * Generate a response message
 *
 * @param {string} type - Error type
 * @returns {Object} Response object
 */
const generateErrorResponse = type => ({
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
});

const getDevicesFromPartnerCloud = () => USER_DEVICES;

const isValidToken = () => {
    /**
     * Always returns true for sample code.
     * You should update this method to your own access token validation.
     */
    return true;
};

const isDeviceOnline = endpointId => {
    log('DEBUG', `isDeviceOnline (endpointId: ${endpointId})`);

    /**
     * Always returns true for sample code.
     * You should update this method to your own validation.
     */
    return true;
};

const callDeviceAPI = (id, action, callback) => {
    callback = callback || (() => {});
    const options = {
        hostname: process.env.device_host,
        port: process.env.device_port,
        //path: '/?id=' + id + '&action=' + action,
        path: '/api/switch?id=' + id + '&action=' + action,
        headers: {
            'X-API-Token': process.env.device_token,
        },
        timeout: 1000
    };

    http.request(options, (res) => {
        log('DEBUG', 'Call to device API ended with statusCode ' + res.statusCode);
        let error;
        if (res.statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${res.statusCode}`);
        }
        if (error) {
            callback(error);
            // consume response data to free up memory
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                callback(null, parsedData);
            } catch (e) {
                callback(e.message);
                console.error(e.message);
            }
        });
    }).end();
};

const callDeviceAPIMqtt = (id, action, callback) => {
    callback = callback || (() => {});
    const client = mqtt.connect('mqtt://' + process.env.mqtt_host, {
        username: process.env.mqtt_username,
        password: process.env.mqtt_password
    });
    const TOPIC = process.env.mqtt_topic;

    client.on('connect', () => {
        client.publish(TOPIC, JSON.stringify({ id, action }), err => {
            callback(err);
            client.end();
        });
    });
};

const generateControlResponse = (endpointId, userAccessToken, state, correlationToken) => ({
    context: {
        properties: [
            {
                namespace: 'Alexa.PowerController',
                name: 'powerState',
                value: state.toUpperCase(),
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
            correlationToken: correlationToken,
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
});

const turnOn = (endpointId, userAccessToken, correlationToken) => {
    log('DEBUG', `turnOn (endpointId: ${endpointId})`);

    // Call device cloud's API to turn on the device
    // callDeviceAPI(endpointId, 'on', (err, httpRes) => {
    callDeviceAPIMqtt(endpointId, 'on', (err, httpRes) => {
        console.log('[DEBUG] Sent turnOn request to device', err, httpRes);
    });
    return generateControlResponse(endpointId, userAccessToken, 'on', correlationToken);
};

const turnOff = (endpointId, userAccessToken, correlationToken) => {
    log('DEBUG', `turnOff (endpointId: ${endpointId})`);

    // Call device cloud's API to turn on the device
    // callDeviceAPI(endpointId, 'off', (err, httpRes) => {
    callDeviceAPIMqtt(endpointId, 'off', (err, httpRes) => {
        console.log('[DEBUG] Sent turnOff request to device', err, httpRes);
    });
    return generateControlResponse(endpointId, userAccessToken, 'off', correlationToken);
};

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
const handleDiscovery = (request, callback) => {
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
};

/**
 * A function to handle control events.
 * This is called when Alexa requests an action such as turning off an appliance.
 *
 * @param {Object} request - The full request object from the Alexa smart home service.
 * @param {function} callback - The callback object on which to succeed or fail the response.
 */
const handleControl = (request, callback) => {
    log('DEBUG', `Control Request: ${JSON.stringify(request)}`);

    /**
     * Get the access token.
     */
    const userAccessToken = request.directive.endpoint.scope.token.trim();

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
            response = turnOn(endpointId, userAccessToken, request.directive.header.correlationToken);
            break;

        case 'TurnOff':
            response = turnOff(endpointId, userAccessToken, request.directive.header.correlationToken);
            break;

        default: {
            log('ERROR', `No supported directive name: ${request.directive.header.name}`);
            callback(null, generateErrorResponse('INVALID_DIRECTIVE'));
            return;
        }
    }

    log('DEBUG', `Control Confirmation: ${JSON.stringify(response)}`);

    callback(null, response);
};

const handleRequest = (request, callback) => {
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
};

exports.handler = (request, context, callback) => {
    try {
        handleRequest(request, callback);
    } catch (e) {
        callback(e);
    }
};
