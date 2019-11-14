const getCapabilities = () => [
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
];

const buildEndpoint = (id, manufacturerName, friendlyName, description) => ({
    'endpointId': id,
    'manufacturerName': manufacturerName,
    'friendlyName': friendlyName,
    'description': description,
    'displayCategories': ['LIGHT'],
    'capabilities': getCapabilities()
});

module.exports = [
      buildEndpoint('0', 'leachiM2k Raspberry', 'Schrank', '000'),
      buildEndpoint('1', 'leachiM2k Raspberry', 'Fenster', '001'),
      buildEndpoint('2', 'leachiM2k Raspberry', 'Sessel', '002'),
];
