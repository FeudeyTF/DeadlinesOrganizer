using HttpServer;
using HttpServer.Headers;
using System.Net;
using HttpListener = HttpServer.HttpListener;

namespace DeadlineOrganizerBackend.Rest
{
    internal class RestServer : IDisposable
    {
        private readonly Dictionary<int, IRestVersion> _versions;

        private readonly HttpListener _server;

        public RestServer(IPAddress ip, int port)
        {
            _versions = [];
            _server = HttpListener.Create(ip, port);
        }

        public void Start()
        {
            _server.RequestReceived += HandleRequestRecieved;
            _server.Start(int.MaxValue);
        }

        public void Stop()
        {
            _server.RequestReceived -= HandleRequestRecieved;
            _server.Stop();
        }

        public void AddVersion(IRestVersion version)
        {
            if(_versions.ContainsKey(version.Version))
                return;
            _versions.Add(version.Version, version);
        }

        private void HandleRequestRecieved(object? sender, RequestEventArgs args)
        {
            args.Response.ContentType = new ContentTypeHeader("application/json; charset=utf-8");
            args.Response.Add(new StringHeader("Access-Control-Allow-Origin", "*"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"));
            args.Response.Add(new StringHeader("Access-Control-Allow-Headers", "Content-Type"));

            Console.WriteLine($"GOT REQUEST {args.Context.Request.Uri} FROM " + args.Context.RemoteEndPoint);
            if (args.Request.Uri.Segments.Length > 1)
            {
                var versionSegment = args.Request.Uri.Segments[1];
                if (versionSegment.StartsWith('v'))
                {
                    if (int.TryParse(versionSegment[1..], out var version))
                    {
                        if(_versions.TryGetValue(version, out var restVersion))
                        {
                            if (args.Request.Uri.Segments.Length > 2)
                            {
                                var fullRoute = string.Join("/", args.Request.Uri.Segments[2..]);
                                foreach (var command in restVersion.GetRestCommands())
                                {
                                    if (command.Route == fullRoute)
                                    {
                                        var response = command.Delegate(new RestEventArgs(args));
                                        var sendedString = args.SendResponse(response);
                                        Console.WriteLine("SENDING " + sendedString + " WITH STATUS " + response.Status);
                                        return;
                                    }
                                }
                                args.SendResponse(new RestResponse(HttpStatusCode.NotFound)
                                {
                                    Error = $"RestCommand was not found in RestAPI v.{restVersion.Version}!"
                                });
                            }
                            else
                                args.SendResponse(new RestResponse(HttpStatusCode.LengthRequired)
                                {
                                    Error = "Invalid length of endpoint!"
                                });

                        }
                        else
                            args.SendResponse(new RestResponse(HttpStatusCode.NotFound)
                            {
                                Error = $"RestAPI v.{version} not found!"
                            });
                    }
                    else
                        args.SendResponse(new RestResponse(HttpStatusCode.UnprocessableEntity)
                        {
                            Error = "RestAPI Version must be a number!"
                        });
                }
                else
                    args.SendResponse(new RestResponse(HttpStatusCode.NotFound)
                    {
                        Error = "RestAPI Version parameter was not found!"
                    });
            }
            else
                args.SendResponse(new RestResponse(HttpStatusCode.LengthRequired)
                {
                    Error = "Invalid length!"
                });
        }

        public void Dispose()
        {
            Stop();
            GC.SuppressFinalize(this);
        }
    }
}
