using System.Net;

namespace DeadlineOrganizerBackend.Rest
{
    public class RestResponse : Dictionary<string, object>
    {
        public HttpStatusCode Status
        {
            get
            {
                if (this["status"] is HttpStatusCode status)
                    return status;
                return HttpStatusCode.InternalServerError;
            }
            set => this["status"] = value;
        }

        public string? Error
        {
            get => this["error"] as string;
            set => this["error"] = value;
        }

        public string? Response
        {
            get => this["response"] as string;
            set => this["response"] = value;
        }

        public RestResponse(HttpStatusCode status = HttpStatusCode.OK)
        {
            Status = status;
        }

        public new object? this[string key]
        {
            get
            {
                if (TryGetValue(key, out var result))
                    return result;
                return null;
            }
            set
            {
                if (!ContainsKey(key))
                {
                    if (value == null)
                        return;
                    Add(key, value);
                }
                else
                {
                    if (value != null)
                        base[key] = value;
                    else
                        Remove(key);
                }
            }
        }
    }
}
