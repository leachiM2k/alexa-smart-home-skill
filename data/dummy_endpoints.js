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
/*
      buildEndpoint('2', 'leachiM2k Raspberry', 'Schrank', '001'),
      buildEndpoint('3', 'leachiM2k Raspberry', 'Fenster', '002'),
      buildEndpoint('4', 'leachiM2k Raspberry', 'Sessel', '003'),
      buildEndpoint('10', 'leachiM2k Raspberry', 'Schlafzimmer', '010'),
      buildEndpoint('20', 'leachiM2k Raspberry', 'Kinderzimmer', '020'),
      buildEndpoint('30', 'leachiM2k Raspberry', 'Küche', '030'),
*/
      buildEndpoint('0', 'leachiM2k Raspberry', 'Schrank', '000'),
      buildEndpoint('1', 'leachiM2k Raspberry', 'Fenster', '001'),
      buildEndpoint('2', 'leachiM2k Raspberry', 'Sessel', '002'),
      buildEndpoint('3', 'leachiM2k Raspberry', 'Schlafzimmer', '003'),
      buildEndpoint('4', 'leachiM2k Raspberry', 'Kinderzimmer', '004'),
      buildEndpoint('5', 'leachiM2k Raspberry', 'Küche', '005'),
];
