import { 
    PropsWithChildren, 
    createContext, 
    useContext, 
    useReducer 
} from "react";

// Pages
import About from "../views/pages/About";
import Projects from "../views/pages/Projects";
import Experience from "../views/pages/Experience";
import Contact from "../views/pages/Contact";
import LandingPage from "../views/pages/LandingPage";

export enum Pages {
    ABOUT = "about",
    PROJECTS = "projects",
    EXPERIENCE = "experience",
    CONTACT = "contact",
    TITLE = "title"
}

type PageState = Pages.ABOUT | Pages.CONTACT | Pages.CONTACT | Pages.EXPERIENCE | Pages.PROJECTS | Pages.TITLE;

type PageAction =
    | { type: Pages.ABOUT, payload: string }
    | { type: Pages.PROJECTS, payload: string }
    | { type: Pages.EXPERIENCE, payload: string }
    | { type: Pages.CONTACT, payload: string }
    | { type: Pages.TITLE, payload: string };

function pageReducer (state: JSX.Element, action: PageAction): JSX.Element {
    switch (action.type) {
        case Pages.ABOUT:
            return <About />;
        case Pages.PROJECTS:
            return <Projects />;
        case Pages.EXPERIENCE:
            return <Experience />;
        case Pages.CONTACT:
            return <Contact />;
        case Pages.TITLE:
            return <LandingPage />;
        default:
            return <LandingPage />;
    }
}

export interface IViewContext {
    page: JSX.Element;
    setPage: (page: PageState) => void;
}

const ViewContext = createContext<IViewContext>({
    page: <LandingPage />,
    setPage: () => {}
});

export const ViewProvider = ({ children }: PropsWithChildren) => {
    const [page, pageDispatch] = useReducer(pageReducer, <LandingPage />); 

    const setPage = (page: PageState) => {
        console.log('clicked')
        pageDispatch({ type: page, payload: page});
        console.log(typeof page)
    };
    return (
        <ViewContext.Provider value={{ page, setPage }}>
            {children}
        </ViewContext.Provider>
    );
}

export const useViewContext = () => useContext<IViewContext>(ViewContext);