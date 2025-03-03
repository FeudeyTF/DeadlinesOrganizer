using HttpServer;
using System.Text;
using System.Text.Json;

namespace DeadlineOrganizerBackend.Rest
{
    internal static class Extensions
    {
        public static string SendResponse(this RequestEventArgs args, RestResponse response)
        {
            var str = JsonSerializer.Serialize(response);
            var bytes = Encoding.UTF8.GetBytes(str);
            args.Response.Body.Write(bytes, 0, bytes.Length);
            args.Response.Status = response.Status;
            return str;
        }
    }
}
