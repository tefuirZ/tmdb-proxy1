const axios = require('axios');

// TMDB图片基础URL
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org';

// 缓存控制时间（1周）
const CACHE_CONTROL = 'public, max-age=604800';

exports.handler = async (event, context) => {
    // 设置CORS头
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': CACHE_CONTROL
    };

    // 处理OPTIONS请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 获取图片路径
        const imagePath = event.path.replace('/.netlify/functions/image-proxy', '');
        
        // 构建TMDB图片URL
        const imageUrl = `${TMDB_IMAGE_BASE_URL}${imagePath}`;

        // 发送请求获取图片
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        // 获取内容类型
        const contentType = response.headers['content-type'];

        // 返回图片数据
        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': contentType
            },
            body: response.data.toString('base64'),
            isBase64Encoded: true
        };
    } catch (error) {
        console.error('Image proxy error:', error);
        return {
            statusCode: error.response?.status || 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to proxy image',
                details: error.message
            })
        };
    }
};