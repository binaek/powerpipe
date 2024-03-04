import {
  CheckNodeStatus,
  CheckNodeType,
  CheckSummary,
  CheckNode,
  CheckResult,
  CheckSeveritySummary,
} from "../index";
import HierarchyNode from "@powerpipe/components/dashboards/check/common/node/HierarchyNode";

class ControlResultNode extends HierarchyNode {
  private readonly _result: CheckResult;

  constructor(
    result: CheckResult,
    sort: string,
    type: CheckNodeType,
    key: string,
    value: string,
    children?: CheckNode[],
  ) {
    super(type, `${key}=${value}`, value, sort, children || []);
    this._result = result;
  }

  get sort(): string {
    return "0";
  }

  get name(): string {
    return `${this._result.control.name}-${this._result.resource}`;
  }

  get title(): string {
    return this._result.reason;
  }

  get result(): CheckResult {
    return this._result;
  }

  get type(): CheckNodeType {
    return "result";
  }

  get summary(): CheckSummary {
    const summary = {
      alarm: 0,
      ok: 0,
      info: 0,
      skip: 0,
      error: 0,
    };
    if (this._result.status === "alarm") {
      summary.alarm += 1;
    }
    if (this._result.status === "error") {
      summary.error += 1;
    }
    if (this._result.status === "ok") {
      summary.ok += 1;
    }
    if (this._result.status === "info") {
      summary.info += 1;
    }
    if (this._result.status === "skip") {
      summary.skip += 1;
    }
    return summary;
  }

  get status(): CheckNodeStatus {
    for (const child of this.children || []) {
      if (child.status === "running") {
        return "running";
      }
    }
    return "complete";
  }

  get severity_summary(): CheckSeveritySummary {
    const summary = {};
    if (this._result.control.severity) {
      summary[this._result.control.severity] =
        this._result.status === "alarm" ? 1 : 0;
    }
    return summary;
  }
}

export default ControlResultNode;
