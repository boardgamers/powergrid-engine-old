type Resource = "coal" | "oil" | "garbage" | "uranium";

export default Resource;

namespace Resource {
  export function values(): Resource[] {
    return ["coal", "oil", "garbage", "uranium"];
  }
}