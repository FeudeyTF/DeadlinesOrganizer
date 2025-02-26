using DeadlineOrganizerBackend.API;
using DeadlineOrganizerBackend.API.Converters;
using DeadlineOrganizerBackend.Rest;
using DeadlineOrganizerBackend.Rest.Attributes;
using HttpServer;
using HttpServer.Headers;
using System.Net;
using System.Text;
using System.Text.Json;
using HttpListener = HttpServer.HttpListener;

namespace DeadlineOrganizerBackend
{
    internal class Program
    {
        public static readonly IPAddress IP;

        public static readonly int Port;

        private static readonly ConfigFile _config;

        private static readonly HttpListener _server;

        private static readonly List<Deadline> _deadlines;

        private static int _deadlinesCount = 1;

        private static List<RestMethodDelegate> _methods;

        private static readonly JsonSerializerOptions _options = new()
        {
            Converters = 
            {
                new DateTimeConverter(),
                new PriorityConverter()
            },
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        static Program()
        {
            _config = ConfigFile.Load("config");
            if (IPAddress.TryParse(_config.ServerIP, out var parsedIp))
                IP = parsedIp;
            else
            {
                IP = IPAddress.Loopback;
                Console.WriteLine("Can't parse config IP address. Using default: " + IP);
            }
            Port = _config.Port;
            _server = HttpListener.Create(IP, Port);
            _deadlines = [];
            _methods = [];
        }

        private static void Main(string[] args)
        {
            _deadlines.Add(new(1, "test", "test123", 1, Priority.High, DateTime.Now.AddDays(-10), DateTime.Now.AddDays(10), []));
            _server.Start(int.MaxValue);

            Console.WriteLine($"Http Server started at {IP}:{Port}");
            _server.RequestReceived += HandleRequestRecieved;
            while (true)
            {
                var command = Console.ReadLine();
                if (!string.IsNullOrEmpty(command) && command.Equals("exit", StringComparison.OrdinalIgnoreCase))
                    return;
            }

            
        }

        private static void HandleRequestRecieved(object? sender, RequestEventArgs args)
        {
            args.Response.ContentType = new ContentTypeHeader("application/json; charset=utf-8");
            args.Response.Add(new StringHeader("Access-Control-Allow-Origin", "*"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Headers", "Content-Type"));

            Console.WriteLine($"GOT REQUEST {args.Context.Request.Uri} FROM " + args.Context.RemoteEndPoint);
            var obj = GetRestObject(args);
            var str = JsonSerializer.Serialize(obj.Object, _options);
            Console.WriteLine("SENDING " + str + " WITH STATUS " + obj.Status);
            var bytes = Encoding.UTF8.GetBytes(str);
            args.Response.Body.Write(bytes, 0, bytes.Length);
            args.Response.Status = obj.Status;
        }

        [RestMethod(HttpMethodType.POST)]
        [RestRoute("deadlines")]
        private static RestResponse CreateDeadline(RequestEventArgs args)
        {
            var body = new byte[args.Request.Body.Length];
            args.Request.Body.ReadExactly(body);
            var str = Encoding.UTF8.GetString(body);
            var deadline = JsonSerializer.Deserialize<Deadline>(str, _options);
            if (deadline != null)
            {
                deadline.Id = ++_deadlinesCount;
                _deadlines.Add(deadline);
                return new RestResponse(HttpStatusCode.Created, deadline);
            }
            return new RestResponse(HttpStatusCode.BadRequest, null);
        }
        
        [RestMethod(HttpMethodType.GET)]
        [RestRoute("deadlines")]
        private static RestResponse GetDeadlines(RequestEventArgs args)
        {
            return new RestResponse(HttpStatusCode.OK, _deadlines);
        }

        private static RestResponse GetRestObject(RequestEventArgs args)
        {
            if (args.Request.Uri.Segments.Length > 0)
            {
                switch (args.Request.Uri.Segments.Last())
                {
                    case "deadlines":
                        if (args.Request.Method == "POST")
                        {
                            var body = new byte[args.Request.Body.Length];
                            args.Request.Body.ReadExactly(body);
                            var str = Encoding.UTF8.GetString(body);
                            var deadline = JsonSerializer.Deserialize<Deadline>(str, _options);
                            if (deadline != null)
                            {
                                deadline.Id = ++_deadlinesCount;
                                _deadlines.Add(deadline);
                                return new RestResponse(HttpStatusCode.Created, deadline);
                            }
                            return new RestResponse(HttpStatusCode.BadRequest, null);
                        }
                        return new RestResponse(HttpStatusCode.OK, _deadlines);
                    case "tags":
                        return new RestResponse(HttpStatusCode.OK, new List<Tag>());
                }
            }
            return new(HttpStatusCode.NoContent, null);
        }
    }
}
