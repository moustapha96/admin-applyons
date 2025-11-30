/* eslint-disable react/prop-types */
import { toSafeInnerHTML } from "../utils/safeHtml";



export default function SafeHTML({
    html,
    as: Tag = "div",
    className,
    style,
}) {
    return <Tag className={className} style={style} dangerouslySetInnerHTML={toSafeInnerHTML(html)} />;
}
