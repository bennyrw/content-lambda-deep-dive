var AWS = require('aws-sdk');
var ec2 = new AWS.EC2();

exports.handler = async (event) => {
    console.log(`Received event: ${JSON.stringify(event)}`);
    
    const ruleName = event['resources'];
    console.log(`Rule name: ${ruleName}`);
    
    const activeVolumesData = await ec2.describeVolumes({
        'Filters': [
            {
                'Name': 'status',
                'Values': ['in-use']
            }
        ]
    }).promise();

    for (let volume of activeVolumesData['Volumes']) {
        const volumeId = volume['VolumeId'];
        const desc = `Automated snapshot of volume for instance ${volume['Attachments'][0]['InstanceId']}`;
        await ec2.createSnapshot({
            VolumeId: volumeId,
            Description: desc
        }).promise();
        
        console.log(`Created snapshot for volume '${volumeId}' ('${desc}')`);
    };
    
    const response = {
        statusCode: 200,
    };
    return response;
};

