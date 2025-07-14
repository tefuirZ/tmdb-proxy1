const axios = require('axios');
const TMDB_BASE_URL = 'https://api.themoviedb.org';

// 创建缓存对象
const cache = new Map();
// 缓存过期时间（10分钟）
const CACHE_DURATION = 10 * 60 * 1000;
// 最大缓存条目数
const MAX_CACHE_SIZE = 1000;

// 缓存清理函数
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now > value.expiry) {
            cache.delete(key);
        }
    }
}

// 检查缓存大小并清理最旧的条目
function checkCacheSize() {
    if (cache.size > MAX_CACHE_SIZE) {
        // 将缓存条目转换为数组并按过期时间排序
        const entries = Array.from(cache.entries());
        entries.sort((a, b) => a[1].expiry - b[1].expiry);

        // 删除最旧的条目，直到缓存大小达到限制
        const deleteCount = cache.size - MAX_CACHE_SIZE;
        entries.slice(0, deleteCount).forEach(([key]) => cache.delete(key));

        console.log(`Cleaned ${deleteCount} old cache entries`);
    }
}

// 定期清理缓存（每10分钟）
setInterval(cleanExpiredCache, CACHE_DURATION);

// Netlify函数处理程序
exports.handler = async (event, context) => {
    // 设置 CORS 头
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // 处理 OPTIONS 请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // 获取请求路径
        const fullPath = event.path.replace('/.netlify/functions/tmdb', '');
        const authHeader = event.headers.authorization;

        // 缓存键只使用请求路径
        const cacheKey = fullPath + (event.queryStringParameters ? JSON.stringify(event.queryStringParameters) : '');

        // 检查缓存
        if (cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey);
            if (Date.now() < cachedData.expiry) {
                console.log('Cache hit:', fullPath);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(cachedData.data)
                };
            } else {
                cache.delete(cacheKey);
            }
        }

        // 构建 TMDB 请求 URL
        let tmdbUrl = `${TMDB_BASE_URL}${fullPath}`;
        
        // 添加查询参数
        if (event.queryStringParameters) {
            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(event.queryStringParameters)) {
                queryParams.append(key, value);
            }
            tmdbUrl += `?${queryParams.toString()}`;
        }

        // 构建请求配置
        const config = {};

        // 只有在存在 Authorization header 时才添加
        if (authHeader) {
            config.headers = {
                'Authorization': authHeader
            };
        }

        // 发送请求到 TMDB
        const response = await axios.get(tmdbUrl, config);

        // 只有响应状态码为 200 时才缓存
        if (response.status === 200) {
            // 在添加新缓存前检查缓存大小
            checkCacheSize();

            cache.set(cacheKey, {
                data: response.data,
                expiry: Date.now() + CACHE_DURATION
            });
            console.log('Cache miss and stored:', fullPath);
        } else {
            console.log('Response not cached due to non-200 status:', response.status);
        }

        // 返回响应
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(response.data)
        };
    } catch (error) {
        console.error('TMDB API error:', error);
        return {
            statusCode: error.response?.status || 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                details: error.response?.data
            })
        };
    }
};