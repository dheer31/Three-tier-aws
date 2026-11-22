
import json
import boto3
import logging

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Connect to DynamoDB
dynamodb = boto3.resource(
    'dynamodb',
    region_name='ap-south-1'
)

table = dynamodb.Table('UserData')

# CORS headers
HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}


def lambda_handler(event, context):

    logger.info("Received event: %s", json.dumps(event))

    # Handle OPTIONS preflight request
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': ''
        }

    try:

        # Extract query parameters
        query_params = event.get('queryStringParameters') or {}

        user_id = query_params.get('userId')

        logger.info("Extracted userId: %s", user_id)

        # Validate userId
        if not user_id:
            return {
                'statusCode': 400,
                'headers': HEADERS,
                'body': json.dumps({
                    'message': 'userId is required'
                })
            }

        # Retrieve data from DynamoDB
        response = table.get_item(
            Key={
                'userId': user_id
            }
        )

        item = response.get('Item')

        # User found
        if item:

            logger.info("User found: %s", user_id)

            return {
                'statusCode': 200,
                'headers': HEADERS,
                'body': json.dumps(item)
            }

        # User not found
        return {
            'statusCode': 404,
            'headers': HEADERS,
            'body': json.dumps({
                'message': 'No user data found'
            })
        }

    except Exception as err:

        logger.exception("Unable to retrieve user data")

        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({
                'message': 'Failed to retrieve user data'
            })
        }
