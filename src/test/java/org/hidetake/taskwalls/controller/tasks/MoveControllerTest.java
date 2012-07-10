package org.hidetake.taskwalls.controller.tasks;

import org.slim3.tester.ControllerTestCase;
import org.hidetake.taskwalls.controller.tasks.MoveController;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;

public class MoveControllerTest extends ControllerTestCase {

    @Test
    public void run() throws Exception {
        tester.start("/tasks/move");
        MoveController controller = tester.getController();
        assertThat(controller, is(notNullValue()));
        assertThat(tester.isRedirect(), is(false));
        assertThat(tester.getDestinationPath(), is(nullValue()));
    }
}
