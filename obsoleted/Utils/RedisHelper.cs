using System.Text.Json;
using StackExchange.Redis;

namespace OnixWebScan.Utils
{
    public class RedisHelper
    {
        private readonly IDatabase _db;

        public RedisHelper(IConnectionMultiplexer connection)
        {
            _db = connection.GetDatabase();
        }

        public Task<bool> SetAsync(string key, string value, TimeSpan? expiry = null)
            => _db.StringSetAsync(key, value, expiry);

        public async Task<string?> GetAsync(string key)
        {
            var value = await _db.StringGetAsync(key);
            return value.HasValue ? value.ToString() : null;
        }

        public async Task SetObjectAsync<T>(string key, T obj, TimeSpan? expiry = null)
        {
            var json = JsonSerializer.Serialize(obj);
            await _db.StringSetAsync(key, json, expiry);
        }

        public async Task<T?> GetObjectAsync<T>(string key)
        {
            var value = await _db.StringGetAsync(key);
            if (value.IsNullOrEmpty) return default;

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // ทำให้ไม่สนตัวเล็ก/ใหญ่
            };

            return JsonSerializer.Deserialize<T>(value!, options);
        }

        public async Task<string> PublishMessageAsync(string stream, string message)
        {
            var msgId = await _db.StreamAddAsync(stream,
                [new NameValueEntry("message", message)]);
                
            return msgId.ToString();
        }
    
        public Task<bool> DeleteAsync(string key)
            => _db.KeyDeleteAsync(key);
    }
}
