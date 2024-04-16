import React from "react";
const Breadcrumb = () => {
    return (
        <nav aria-label="Breadcrumb navigation">
            {" "}
            <ol className="breadcrumb">
                {" "}
                <li className="breadcrumb-item">
                    {" "}
                    <a href="path-to/previous-page" className="text-white">
                        {" "}
                        <span className="mrgn-right-sm"> {"<"} </span> Previous Page{" "}
                    </a>{" "}
                </li>{" "}
                <li className="breadcrumb-item text-white"> Current Page </li>{" "}
                <li className="breadcrumb-item">
                    {" "}
                    <a href="path-to/next-page" className="text-white">
                        {" "}
                        Next Level{" "}
                    </a>{" "}
                </li>{" "}
            </ol>{" "}
        </nav>
    );
};
export default Breadcrumb;
